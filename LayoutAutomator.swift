import Cocoa
import Foundation // Required for PropertyListDecoder
import os.log

// Define an OSLog subsystem and category for this component
private let autoLog = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.example.Moom4", category: "LayoutAutomator")

// Data structure for app-to-layout mappings (as defined previously)
struct AppLayoutMapping: Codable { // No changes needed to struct itself for logging
    let bundleIdentifier: String
    let layoutName: String
    let applicationPath: String?
    var enabled: Bool?

    enum CodingKeys: String, CodingKey {
        case bundleIdentifier, layoutName, applicationPath, enabled
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        bundleIdentifier = try container.decode(String.self, forKey: .bundleIdentifier)
        layoutName = try container.decode(String.self, forKey: .layoutName)
        applicationPath = try container.decodeIfPresent(String.self, forKey: .applicationPath)
        let decodedEnabled = try container.decodeIfPresent(Bool.self, forKey: .enabled)
        enabled = decodedEnabled ?? true
    }

    init(bundleIdentifier: String, layoutName: String, applicationPath: String? = nil, enabled: Bool = true) {
        self.bundleIdentifier = bundleIdentifier
        self.layoutName = layoutName
        self.applicationPath = applicationPath
        self.enabled = enabled
    }
}

class LayoutAutomator {

    private var mappings: [AppLayoutMapping] = []
    private let mappingsFileName = "AppLayoutMappings.plist"
    private var appLaunchDetector: AppLaunchDetector? // AppLaunchDetector.swift is expected to be in the project
    // IMPORTANT: Replace "Moom4" with the actual application support directory name for Moom.
    private let appSupportSubdirectory = "Moom4"

    init() {
        loadMappings()
        setupAppLaunchDetection()
        os_log(.info, log: autoLog, "LayoutAutomator initialized. Mappings loaded: %d", mappings.count)
    }

    private func getMappingsFileURL() -> URL? {
        guard var appSupportDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            os_log(.error, log: autoLog, "Cannot find Application Support directory.")
            return nil
        }
        appSupportDir.appendPathComponent(appSupportSubdirectory)

        do {
            try FileManager.default.createDirectory(at: appSupportDir, withIntermediateDirectories: true, attributes: nil)
            os_log(.debug, log: autoLog, "Ensured Application Support subdirectory exists at %{public}s", appSupportDir.path)
        } catch {
            os_log(.error, log: autoLog, "Error creating Moom4 Application Support directory at %{public}s: %{public}s", appSupportDir.path, error.localizedDescription)
            return nil
        }

        return appSupportDir.appendPathComponent(mappingsFileName)
    }

    func loadMappings() {
        guard let fileURL = getMappingsFileURL() else {
            os_log(.error, log: autoLog, "Could not construct mappings file URL for loading. No mappings will be loaded.")
            self.mappings = []
            return
        }

        os_log(.debug, log: autoLog, "Attempting to load mappings from: %{public}s", fileURL.path)

        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            os_log(.info, log: autoLog, "Mappings file does not exist at %{public}s. Starting with empty mappings.", fileURL.path)
            self.mappings = []
            return
        }

        do {
            let data = try Data(contentsOf: fileURL)
            let decoder = PropertyListDecoder()
            self.mappings = try decoder.decode([AppLayoutMapping].self, from: data)
            os_log(.info, log: autoLog, "Successfully loaded %d mappings from %{public}s.", self.mappings.count, fileURL.path)
        } catch let DecodingError.dataCorrupted(context) {
            os_log(.error, log: autoLog, "Data corrupted while decoding mappings from %{public}s: %{public}s. Debugging description: %{public}s", fileURL.path, context.localizedDescription, context.debugDescription)
            self.mappings = []
        } catch let DecodingError.keyNotFound(key, context) {
            os_log(.error, log: autoLog, "Key '%{public}s' not found while decoding mappings from %{public}s. Context: %{public}s. Debugging description: %{public}s", key.stringValue, fileURL.path, context.codingPath.map { $0.stringValue }.joined(separator: "."), context.debugDescription)
            self.mappings = []
        } catch let DecodingError.valueNotFound(value, context) {
            os_log(.error, log: autoLog, "Value '%{public}s' not found while decoding mappings from %{public}s. Context: %{public}s. Debugging description: %{public}s", String(describing: value), fileURL.path, context.codingPath.map { $0.stringValue }.joined(separator: "."), context.debugDescription)
            self.mappings = []
        } catch let DecodingError.typeMismatch(type, context) {
            os_log(.error, log: autoLog, "Type mismatch for '%{public}s' while decoding mappings from %{public}s. Context: %{public}s. Debugging description: %{public}s", String(describing: type), fileURL.path, context.codingPath.map { $0.stringValue }.joined(separator: "."), context.debugDescription)
            self.mappings = []
        } catch { // Catch any other IO or general errors
            os_log(.error, log: autoLog, "Error loading or decoding mappings from %{public}s: %{public}s", fileURL.path, error.localizedDescription)
            self.mappings = []
        }
    }

    func saveMappings() { // For potential use by a configuration UI or tool
        guard let fileURL = getMappingsFileURL() else {
            os_log(.error, log: autoLog, "Could not construct mappings file URL for saving. Mappings not saved.")
            return
        }

        do {
            let encoder = PropertyListEncoder()
            encoder.outputFormat = .xml
            let data = try encoder.encode(self.mappings)
            try data.write(to: fileURL, options: .atomic)
            os_log(.info, log: autoLog, "Successfully saved %d mappings to %{public}s", self.mappings.count, fileURL.path)
        } catch {
            os_log(.error, log: autoLog, "Error encoding or writing mappings to %{public}s: %{public}s", fileURL.path, error.localizedDescription)
        }
    }

    private func setupAppLaunchDetection() {
        // Assumes AppLaunchDetector.swift (already updated with os_log) is part of the project.
        appLaunchDetector = AppLaunchDetector(launchHandler: handleAppLaunch)
        os_log(.info, log: autoLog, "App launch detection setup complete.")
    }

    private func handleAppLaunch(launchedApp: NSRunningApplication) {
        guard let bundleID = launchedApp.bundleIdentifier else {
            os_log(.info, log: autoLog, "Launched app '%{public}s' has no bundle identifier. Cannot process for layout automation.", launchedApp.localizedName ?? "Unknown App")
            return
        }

        let appName = launchedApp.localizedName ?? "Unknown App"
        os_log(.info, log: autoLog, "Detected launch of '%{public}s' (BundleID: %{public}s). Checking mappings...", appName, bundleID)

        if let mapping = findMapping(for: bundleID) {
            if mapping.enabled ?? true {
                os_log(.info, log: autoLog, "Found enabled mapping for '%{public}s': Apply layout '%{public}s'", bundleID, mapping.layoutName)
                applyMoomLayout(layoutName: mapping.layoutName, forApp: appName)
            } else {
                os_log(.info, log: autoLog, "Found mapping for '%{public}s', but it is disabled.", bundleID)
            }
        } else {
            os_log(.debug, log: autoLog, "No mapping found for '%{public}s'.", bundleID)
        }
    }

    private func findMapping(for bundleIdentifier: String) -> AppLayoutMapping? {
        return mappings.first { $0.bundleIdentifier == bundleIdentifier }
    }

    private func isMoomRunning() -> Bool {
        // Moom's bundle ID, confirm if it's different (e.g. "com.manytricks.Moom")
        // For Many Tricks Moom, it's "com.manytricks.Moom"
        let moomBundleID = "com.manytricks.Moom"
        let runningApps = NSWorkspace.shared.runningApplications
        let isRunning = runningApps.contains { $0.bundleIdentifier == moomBundleID }
        os_log(.debug, log: autoLog, "Is Moom running? %{public}s", isRunning ? "Yes" : "No")
        return isRunning
    }

    private func applyMoomLayout(layoutName: String, forApp appName: String) {
        guard isMoomRunning() else {
            os_log(.error, log: autoLog, "Moom is not running. Cannot apply layout '%{public}s' for application '%{public}s'.", layoutName, appName)
            // Optionally, notify the user here via UserNotifications if this is a user-facing app.
            return
        }

        let escapedLayoutName = layoutName.replacingOccurrences(of: "\"", with: "\\\"")
        let scriptSource = """
        tell application "Moom"
            arrange windows according to layout "\(escapedLayoutName)"
        end tell
        """

        os_log(.debug, log: autoLog, "Executing AppleScript to apply layout '%{public}s' for app '%{public}s'. Script: %{private}s", layoutName, appName, scriptSource)

        var errorDict: NSDictionary?
        if let scriptObject = NSAppleScript(source: scriptSource) {
            if scriptObject.executeAndReturnError(&errorDict) == nil {
                if let errorInfo = errorDict {
                    let errorMessage = errorInfo[NSAppleScript.errorMessage] as? String ?? "Unknown AppleScript error"
                    let errorNumber = errorInfo[NSAppleScript.errorNumber] as? NSNumber // Corrected type
                    os_log(.error, log: autoLog, "AppleScript execution error applying layout '%{public}s' for '%{public}s': %{public}s (Error #: %d)", layoutName, appName, errorMessage, errorNumber?.intValue ?? 0)
                    // Optionally, notify the user about the failure.
                } else {
                    os_log(.error, log: autoLog, "AppleScript execution failed for layout '%{public}s' for '%{public}s' with no specific error dictionary.", layoutName, appName)
                }
            } else {
                os_log(.info, log: autoLog, "Successfully told Moom to apply layout '%{public}s' for application '%{public}s'.", layoutName, appName)
            }
        } else {
            os_log(.error, log: autoLog, "Could not initialize NSAppleScript object for layout '%{public}s' for '%{public}s'.", layoutName, appName)
        }
    }

    // Conceptual: Method to add a new mapping and save (for testing or future UI)
    func addMappingAndSave(bundleID: String, layoutName: String, appPath: String? = nil, enabled: Bool = true) {
        mappings.removeAll { $0.bundleIdentifier == bundleID }
        let newMapping = AppLayoutMapping(bundleIdentifier: bundleID, layoutName: layoutName, applicationPath: appPath, enabled: enabled)
        mappings.append(newMapping)
        saveMappings() // This will log success/failure
        os_log(.info, log: autoLog, "Added/Updated mapping for %{public}s with layout '%{public}s' (Enabled: %{public}s) and initiated save.", bundleID, layoutName, String(describing: enabled))
    }
}

// --- Example Usage (Conceptual) ---
// (Example usage remains the same conceptually but would benefit from os_log in its test calls if run standalone)
// /*
//  let automator = LayoutAutomator()
//
//  // To test, you might want to manually create a plist or use MappingConfigTool.swift first.
//  // Example: ./MappingConfigTool add com.apple.TextEdit "My Test Layout"
//  // Then run code that uses LayoutAutomator.
//
//  RunLoop.main.run() // Keeps the script/app alive to receive notifications.
// */
```

The embedded `AppLaunchDetector` class definition has been removed as it's assumed to be in `AppLaunchDetector.swift` (which was updated in the previous step).
The `appSupportSubdirectory` is explicitly "Moom4" but noted that it should match the actual app's support directory.
The AppleScript error number is now correctly cast to `NSNumber` then `intValue`.
The `addMappingAndSave` function now also logs the enabled status.

Now, I'll update `MappingConfigTool.swift`.
