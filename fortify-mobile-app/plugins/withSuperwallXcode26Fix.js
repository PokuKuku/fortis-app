const { withDangerousMod, withXcodeProject } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const PATCH_MARKER =
  "# Xcode 26 surfaces an overload ambiguity in older SuperwallKit builds.";
const EXPLICIT_MODULES_MARKER =
  "# Xcode 26 can fail dependency scanning for React Native prebuilt modules when Swift explicit modules are enabled.";

const EXPLICIT_MODULES_SNIPPET = `
    # Xcode 26 can fail dependency scanning for React Native prebuilt modules when Swift explicit modules are enabled.
    # Disable explicit modules for Pods so Swift module scans can resolve React C++ stdlib headers.
    projects = [installer.pods_project]
    projects += installer.generated_projects if installer.respond_to?(:generated_projects)
    projects.compact.each do |project|
      project.build_configurations.each do |config|
        config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
      end

      project.targets.each do |target|
        target.build_configurations.each do |config|
          config.build_settings['SWIFT_ENABLE_EXPLICIT_MODULES'] = 'NO'
        end
      end

      project.save
    end
`;

const PATCH_SNIPPET = `
${EXPLICIT_MODULES_SNIPPET}
    # Xcode 26 surfaces an overload ambiguity in older SuperwallKit builds.
    # Patch the generated pod source to call through a private Swift helper.
    superwall_file = File.join(
      __dir__,
      'Pods',
      'SuperwallKit',
      'Sources',
      'SuperwallKit',
      'Paywall',
      'Presentation',
      'Get Presentation Result',
      'PublicGetPresentationResult.swift'
    )

    if File.exist?(superwall_file)
      superwall_source = File.read(superwall_file)

      unless superwall_source.include?('_swiftGetPresentationResult')
        helper = <<~SWIFT
          
            // Private helper to disambiguate overloads for Objective-C wrappers
            private func _swiftGetPresentationResult(
              forPlacement placement: String,
              params: [String: Any]? = nil
            ) async -> PresentationResult {
              return await self.getPresentationResult(forPlacement: placement, params: params)
            }
        SWIFT

        marker = "  /// Preemptively gets the result of registering an placement.\\n"
        superwall_source.sub!(marker, helper + "\\n" + marker)
      end

      superwall_source.gsub!(
        "    let result = await getPresentationResult(forPlacement: placement, params: params)",
        "    let result: PresentationResult = await _swiftGetPresentationResult(forPlacement: placement, params: params)"
      )
      superwall_source.gsub!(
        "    let result = await getPresentationResult(forPlacement: placement, params: nil)",
        "    let result: PresentationResult = await _swiftGetPresentationResult(forPlacement: placement, params: nil)"
      )

      File.chmod(0644, superwall_file)
      File.write(superwall_file, superwall_source)
    end
`;

function patchPodfile(contents) {
  if (contents.includes(PATCH_MARKER) && contents.includes(EXPLICIT_MODULES_MARKER)) {
    return contents;
  }

  if (contents.includes(PATCH_MARKER) && !contents.includes(EXPLICIT_MODULES_MARKER)) {
    return contents.replace(`    ${PATCH_MARKER}`, `${EXPLICIT_MODULES_SNIPPET}\n    ${PATCH_MARKER}`);
  }

  const anchor = "    )\n  end";
  if (!contents.includes(anchor)) {
    throw new Error("Unable to find the React Native post_install block in ios/Podfile.");
  }

  return contents.replace(anchor, `    )\n${PATCH_SNIPPET}\n  end`);
}

function disableExplicitModules(project) {
  const configurations = project.pbxXCBuildConfigurationSection();

  for (const config of Object.values(configurations)) {
    if (!config || typeof config !== "object" || !config.buildSettings) {
      continue;
    }

    config.buildSettings.SWIFT_ENABLE_EXPLICIT_MODULES = "NO";
  }
}

module.exports = function withSuperwallXcode26Fix(config) {
  config = withXcodeProject(config, (modConfig) => {
    disableExplicitModules(modConfig.modResults);
    return modConfig;
  });

  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const podfilePath = path.join(modConfig.modRequest.platformProjectRoot, "Podfile");
      const contents = fs.readFileSync(podfilePath, "utf8");
      const nextContents = patchPodfile(contents);

      if (contents !== nextContents) {
        fs.writeFileSync(podfilePath, nextContents);
      }

      return modConfig;
    },
  ]);
};
