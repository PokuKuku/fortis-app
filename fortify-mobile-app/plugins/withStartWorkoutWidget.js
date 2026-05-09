const { withDangerousMod } = require("@expo/config-plugins");
const plist = require("@expo/plist").default;
const fs = require("fs");
const path = require("path");
const xcode = require("xcode");

const WIDGET_NAME = "FortifyStartWidget";
const WIDGET_BUNDLE_SUFFIX = ".FortifyStartWidget";
const APP_TARGET_NAME = "FortifyAI";
const IOS_DEPLOYMENT_TARGET = "16.0";
const WIDGET_ASSET_CATALOG = "FortifyStartWidgetAssets.xcassets";
const DUMBBELL_IMAGESET = "Dumbbell.imageset";

const SWIFT_SOURCE = `import SwiftUI
import WidgetKit

private let startWorkoutURL = URL(string: "fortis:///start-workout")!

struct FortifyStartEntry: TimelineEntry {
  let date: Date
}

struct FortifyStartProvider: TimelineProvider {
  func placeholder(in context: Context) -> FortifyStartEntry {
    FortifyStartEntry(date: Date())
  }

  func getSnapshot(in context: Context, completion: @escaping (FortifyStartEntry) -> Void) {
    completion(FortifyStartEntry(date: Date()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<FortifyStartEntry>) -> Void) {
    completion(Timeline(entries: [FortifyStartEntry(date: Date())], policy: .never))
  }
}

struct DumbbellMark: View {
  var body: some View {
    Image("Dumbbell")
      .renderingMode(.template)
      .resizable()
      .scaledToFit()
  }
}

struct FortifyStartWidgetView: View {
  @Environment(\\.widgetFamily) private var family
  let entry: FortifyStartEntry

  var body: some View {
    switch family {
    case .accessoryCircular:
      VStack(spacing: 3) {
        DumbbellMark()
          .frame(width: 27, height: 16)
        Text("START")
          .font(.system(size: 8, weight: .heavy, design: .rounded))
          .minimumScaleFactor(0.7)
      }
      .foregroundStyle(.white)
      .widgetAccentable()
      .widgetURL(startWorkoutURL)

    case .accessoryRectangular:
      HStack(spacing: 7) {
        DumbbellMark()
          .frame(width: 34, height: 20)
        Text("START")
          .font(.system(size: 14, weight: .heavy, design: .rounded))
      }
      .foregroundStyle(.white)
      .widgetAccentable()
      .widgetURL(startWorkoutURL)

    default:
      VStack(spacing: 3) {
        DumbbellMark()
          .frame(width: 27, height: 16)
        Text("START")
          .font(.system(size: 8, weight: .heavy, design: .rounded))
          .minimumScaleFactor(0.7)
      }
      .foregroundStyle(.white)
      .widgetAccentable()
      .widgetURL(startWorkoutURL)
    }
  }
}

@main
struct FortifyStartWidget: Widget {
  let kind = "FortifyStartWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: FortifyStartProvider()) { entry in
      FortifyStartWidgetView(entry: entry)
    }
    .configurationDisplayName("Start Workout")
    .description("Start your saved Fortify schedule.")
    .supportedFamilies([.accessoryCircular, .accessoryRectangular])
  }
}
`;

const INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>$(DEVELOPMENT_LANGUAGE)</string>
  <key>CFBundleDisplayName</key>
  <string>Start Workout</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>$(MARKETING_VERSION)</string>
  <key>CFBundleVersion</key>
  <string>$(CURRENT_PROJECT_VERSION)</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>
`;

function removeIfExists(filePath) {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { force: true, recursive: true });
  }
}

function removeAppGroupEntitlement(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  try {
    const entitlements = plist.parse(fs.readFileSync(filePath, "utf8"));
    delete entitlements["com.apple.security.application-groups"];
    fs.writeFileSync(filePath, plist.build(entitlements));
  } catch {
    // Keep prebuild resilient if a local entitlements file is temporarily malformed.
  }
}

function writeWidgetFiles(projectRoot) {
  const widgetRoot = path.join(projectRoot, WIDGET_NAME);
  const appRoot = path.join(projectRoot, APP_TARGET_NAME);
  const assetRoot = path.join(widgetRoot, WIDGET_ASSET_CATALOG);
  const imageSetRoot = path.join(assetRoot, DUMBBELL_IMAGESET);
  const sourceIcon = path.join(
    projectRoot,
    "..",
    "assets",
    "icons",
    "dumbbell.svg",
  );

  fs.mkdirSync(widgetRoot, { recursive: true });
  fs.mkdirSync(imageSetRoot, { recursive: true });
  fs.writeFileSync(path.join(widgetRoot, `${WIDGET_NAME}.swift`), SWIFT_SOURCE);
  fs.writeFileSync(path.join(widgetRoot, "Info.plist"), INFO_PLIST);
  fs.writeFileSync(
    path.join(assetRoot, "Contents.json"),
    JSON.stringify({ info: { author: "xcode", version: 1 } }, null, 2),
  );
  fs.writeFileSync(
    path.join(imageSetRoot, "Contents.json"),
    JSON.stringify(
      {
        images: [{ filename: "dumbbell.svg", idiom: "universal" }],
        info: { author: "xcode", version: 1 },
        properties: {
          "preserves-vector-representation": true,
          "template-rendering-intent": "template",
        },
      },
      null,
      2,
    ),
  );
  fs.copyFileSync(sourceIcon, path.join(imageSetRoot, "dumbbell.svg"));

  removeIfExists(path.join(widgetRoot, "BankGothicMediumBT.ttf"));
  removeIfExists(path.join(widgetRoot, `${WIDGET_NAME}.entitlements`));
  removeIfExists(path.join(appRoot, "FortifyWidgetDataModule.swift"));
  removeIfExists(path.join(appRoot, "FortifyWidgetDataModule.m"));
  removeAppGroupEntitlement(path.join(appRoot, `${APP_TARGET_NAME}.entitlements`));
}

function getAppBuildSettings(project) {
  const buildConfigs = project.pbxXCBuildConfigurationSection();
  const appConfig = Object.values(buildConfigs).find((config) => {
    if (!config || typeof config !== "object" || !config.buildSettings) {
      return false;
    }

    return (
      config.buildSettings.PRODUCT_NAME === APP_TARGET_NAME ||
      config.buildSettings.PRODUCT_NAME === `"${APP_TARGET_NAME}"`
    );
  });

  return appConfig?.buildSettings ?? {};
}

function getAppInfoPlistValues(projectRoot) {
  const infoPlistPath = path.join(projectRoot, APP_TARGET_NAME, "Info.plist");
  if (!fs.existsSync(infoPlistPath)) {
    return {};
  }

  try {
    return plist.parse(fs.readFileSync(infoPlistPath, "utf8"));
  } catch {
    return {};
  }
}

function updateTargetBuildSettings(
  projectRoot,
  project,
  targetUuid,
  bundleIdentifier,
) {
  const buildConfigs = project.pbxXCBuildConfigurationSection();
  const appBuildSettings = getAppBuildSettings(project);
  const appInfoPlist = getAppInfoPlistValues(projectRoot);
  const appBuildNumber =
    appInfoPlist.CFBundleVersion ?? appBuildSettings.CURRENT_PROJECT_VERSION;
  const appMarketingVersion =
    appInfoPlist.CFBundleShortVersionString ??
    appBuildSettings.MARKETING_VERSION;

  for (const [uuid, config] of Object.entries(buildConfigs)) {
    if (uuid.endsWith("_comment") || !config.buildSettings) {
      continue;
    }

    const isWidgetConfig =
      config.buildSettings.PRODUCT_NAME === `"${WIDGET_NAME}"` ||
      config.buildSettings.PRODUCT_NAME === `"$(TARGET_NAME)"` ||
      config.buildSettings.PRODUCT_NAME === "$(TARGET_NAME)" ||
      config.buildSettings.PRODUCT_BUNDLE_IDENTIFIER ===
        `"${bundleIdentifier}"` ||
      config.buildSettings.PRODUCT_BUNDLE_IDENTIFIER === bundleIdentifier ||
      config.buildSettings.INFOPLIST_FILE === `${WIDGET_NAME}/Info.plist`;

    if (!isWidgetConfig) {
      continue;
    }

    config.buildSettings.APPLICATION_EXTENSION_API_ONLY = "YES";
    if (appBuildNumber) {
      config.buildSettings.CURRENT_PROJECT_VERSION = appBuildNumber;
    }
    if (appBuildSettings.DEVELOPMENT_TEAM) {
      config.buildSettings.DEVELOPMENT_TEAM = appBuildSettings.DEVELOPMENT_TEAM;
    }
    config.buildSettings.GENERATE_INFOPLIST_FILE = "NO";
    config.buildSettings.INFOPLIST_FILE = `${WIDGET_NAME}/Info.plist`;
    delete config.buildSettings.CODE_SIGN_ENTITLEMENTS;
    config.buildSettings.IPHONEOS_DEPLOYMENT_TARGET = IOS_DEPLOYMENT_TARGET;
    if (appMarketingVersion) {
      config.buildSettings.MARKETING_VERSION = appMarketingVersion;
    }
    config.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${bundleIdentifier}"`;
    config.buildSettings.PRODUCT_NAME = `"${WIDGET_NAME}"`;
    config.buildSettings.SKIP_INSTALL = "YES";
    config.buildSettings.SWIFT_VERSION = "5.0";
    config.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
  }
}

function ensureWidgetGroup(project) {
  const existingGroupKey =
    project.findPBXGroupKey({ name: WIDGET_NAME }) ||
    project.findPBXGroupKey({ path: WIDGET_NAME });

  if (existingGroupKey) {
    return existingGroupKey;
  }

  const group = project.addPbxGroup([], WIDGET_NAME, WIDGET_NAME);
  const mainGroupKey = project.getFirstProject().firstProject.mainGroup;
  project.addToPbxGroup(group.uuid, mainGroupKey);
  return group.uuid;
}

function getTargetUuid(project, targetName) {
  const target = project.pbxTargetByName(targetName);
  if (target?.uuid) {
    return target.uuid;
  }

  const entry = Object.entries(project.pbxNativeTargetSection()).find(
    ([key, value]) => !key.endsWith("_comment") && value.name === targetName,
  );

  return entry?.[0] ?? null;
}

function removeProjectEntries(project, fileNames) {
  const normalized = new Set(fileNames);
  const fileRefs = project.pbxFileReferenceSection();
  const buildFiles = project.pbxBuildFileSection();

  const removedFileRefIds = new Set();
  Object.entries(fileRefs).forEach(([key, entry]) => {
    if (key.endsWith("_comment") || !entry || typeof entry !== "object") {
      return;
    }

    const pathValue = String(entry.path ?? "").replace(/^"|"$/g, "");
    const nameValue = String(entry.name ?? "").replace(/^"|"$/g, "");
    const basename = path.basename(pathValue || nameValue);
    if (normalized.has(basename)) {
      removedFileRefIds.add(key);
      delete fileRefs[key];
      delete fileRefs[`${key}_comment`];
    }
  });

  const removedBuildFileIds = new Set();
  Object.entries(buildFiles).forEach(([key, entry]) => {
    if (key.endsWith("_comment") || !entry || typeof entry !== "object") {
      return;
    }

    if (removedFileRefIds.has(entry.fileRef)) {
      removedBuildFileIds.add(key);
      delete buildFiles[key];
      delete buildFiles[`${key}_comment`];
    }
  });

  Object.values(project.hash.project.objects).forEach((section) => {
    if (!section || typeof section !== "object") {
      return;
    }

    Object.values(section).forEach((entry) => {
      if (!entry || typeof entry !== "object") {
        return;
      }

      if (Array.isArray(entry.children)) {
        entry.children = entry.children.filter(
          (child) => !removedFileRefIds.has(child.value),
        );
      }
      if (Array.isArray(entry.files)) {
        entry.files = entry.files.filter(
          (file) => !removedBuildFileIds.has(file.value),
        );
      }
    });
  });
}

function removeUndefinedProjectValues(project) {
  const sections = [
    project.pbxFileReferenceSection(),
    project.pbxBuildFileSection(),
    project.pbxXCBuildConfigurationSection(),
  ];

  sections.forEach((section) => {
    Object.values(section).forEach((entry) => {
      if (entry && typeof entry === "object") {
        Object.keys(entry).forEach((key) => {
          if (entry[key] === undefined || entry[key] === "undefined") {
            delete entry[key];
          }
        });
      }
    });
  });
}

function ensureWidgetTarget(projectRoot, bundleIdentifier) {
  const pbxprojPath = path.join(
    projectRoot,
    "FortifyAI.xcodeproj",
    "project.pbxproj",
  );
  const project = xcode.project(pbxprojPath);
  project.parseSync();
  const widgetGroupKey = ensureWidgetGroup(project);

  let target = project.pbxTargetByName(WIDGET_NAME);
  let targetUuid = getTargetUuid(project, WIDGET_NAME);

  if (!target) {
    target = project.addTarget(
      WIDGET_NAME,
      "app_extension",
      WIDGET_NAME,
      bundleIdentifier,
    );
    targetUuid = target.uuid;
    project.addBuildPhase(
      [`${WIDGET_NAME}/${WIDGET_NAME}.swift`],
      "PBXSourcesBuildPhase",
      "Sources",
      targetUuid,
    );
    project.addBuildPhase(
      [`${WIDGET_NAME}/${WIDGET_ASSET_CATALOG}`],
      "PBXResourcesBuildPhase",
      "Resources",
      targetUuid,
    );
  }

  if (!targetUuid) {
    throw new Error(`Unable to find ${WIDGET_NAME} target UUID.`);
  }

  removeProjectEntries(project, [
    "BankGothicMediumBT.ttf",
    "FortifyWidgetDataModule.swift",
    "FortifyWidgetDataModule.m",
  ]);

  if (!project.hasFile(`${WIDGET_NAME}/${WIDGET_ASSET_CATALOG}`)) {
    project.addResourceFile(
      WIDGET_ASSET_CATALOG,
      { target: targetUuid, lastKnownFileType: "folder.assetcatalog" },
      widgetGroupKey,
    );
  }

  updateTargetBuildSettings(projectRoot, project, targetUuid, bundleIdentifier);
  removeUndefinedProjectValues(project);
  fs.writeFileSync(pbxprojPath, project.writeSync());
}

module.exports = function withStartWorkoutWidget(config) {
  return withDangerousMod(config, [
    "ios",
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.platformProjectRoot;
      const bundleIdentifier = `${modConfig.ios.bundleIdentifier}${WIDGET_BUNDLE_SUFFIX}`;

      writeWidgetFiles(projectRoot);
      ensureWidgetTarget(projectRoot, bundleIdentifier);

      return modConfig;
    },
  ]);
};
