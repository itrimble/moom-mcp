import Foundation
import os.log // Added for logging

// Define an OSLog subsystem and category for this component
private let toolLog = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.example.Moom4.ConfigTool", category: "MappingConfigTool")

// Data structure for app-to-layout mappings (consistent with previous definitions)
struct AppLayoutMapping: Codable, Equatable {
    let bundleIdentifier: String
    let layoutName: String
    let applicationPath: String?
    var enabled: Bool?

    enum CodingKeys: String, CodingKey {
        case bundleIdentifier, layoutName, applicationPath, enabled
    }

    init(bundleIdentifier: String, layoutName: String, applicationPath: String? = nil, enabled: Bool = true) {
        self.bundleIdentifier = bundleIdentifier
        self.layoutName = layoutName
        self.applicationPath = applicationPath
        self.enabled = enabled
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        bundleIdentifier = try container.decode(String.self, forKey: .bundleIdentifier)
        layoutName = try container.decode(String.self, forKey: .layoutName)
        applicationPath = try container.decodeIfPresent(String.self, forKey: .applicationPath)
        enabled = try container.decodeIfPresent(Bool.self, forKey: .enabled) ?? true
    }

    func description() -> String {
        let status = (enabled ?? true) ? "Enabled" : "Disabled"
        let pathInfo = applicationPath != nil ? " (Path: \(applicationPath!))" : ""
        return "BundleID: \(bundleIdentifier) -> Layout: '\(layoutName)'\(pathInfo) - \(status)"
    }
}

class MappingManager {
    private var mappings: [AppLayoutMapping] = []
    private let mappingsFileName = "AppLayoutMappings.plist"
    private let appSupportSubdirectory = "Moom4" // Should match LayoutAutomator

    init() {
        loadMappings()
    }

    private func getMappingsFileURL() -> URL? {
        guard var appSupportDir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            os_log(.error, log: toolLog, "Cannot find Application Support directory.")
            return nil
        }
        appSupportDir.appendPathComponent(appSupportSubdirectory)

        do {
            try FileManager.default.createDirectory(at: appSupportDir, withIntermediateDirectories: true, attributes: nil)
            os_log(.debug, log: toolLog, "Ensured Application Support subdirectory exists: %{public}s", appSupportDir.path)
        } catch {
            os_log(.error, log: toolLog, "Error creating %{public}s Application Support directory: %{public}s", appSupportSubdirectory, error.localizedDescription)
            // Also print to console for immediate CLI feedback
            print("Error: Could not create Application Support directory at \(appSupportDir.path): \(error.localizedDescription)")
            return nil
        }
        return appSupportDir.appendPathComponent(mappingsFileName)
    }

    func loadMappings() {
        guard let fileURL = getMappingsFileURL() else {
            // Error already logged by getMappingsFileURL if it couldn't create dir.
            // If only URL construction failed (e.g. appSupportDir was nil), log here.
            if FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first == nil {
                 print("Error: Failed to get Application Support directory URL.")
            }
            self.mappings = []
            return
        }

        if !FileManager.default.fileExists(atPath: fileURL.path) {
            os_log(.info, log: toolLog, "Mappings file does not exist at %{public}s. Starting with empty mappings.", fileURL.path)
            print("Info: Mappings file does not exist. New mappings will create it.")
            self.mappings = []
            return
        }

        do {
            let data = try Data(contentsOf: fileURL)
            let decoder = PropertyListDecoder()
            self.mappings = try decoder.decode([AppLayoutMapping].self, from: data)
            os_log(.info, log: toolLog, "Successfully loaded %d mappings from %{public}s.", self.mappings.count, fileURL.path)
        } catch {
            os_log(.error, log: toolLog, "Error loading or decoding mappings from %{public}s: %{public}s", fileURL.path, error.localizedDescription)
            print("Error: Could not load or parse mappings file at \(fileURL.path). Check file format. Details: \(error.localizedDescription)")
            self.mappings = []
        }
    }

    func saveMappings() {
        guard let fileURL = getMappingsFileURL() else {
            print("Error: Could not get mappings file URL. Mappings not saved.") // Also logged by getMappingsFileURL
            return
        }

        do {
            let encoder = PropertyListEncoder()
            encoder.outputFormat = .xml
            let data = try encoder.encode(self.mappings)
            try data.write(to: fileURL, options: .atomic)
            os_log(.info, log: toolLog, "Successfully saved %d mappings to %{public}s", self.mappings.count, fileURL.path)
            print("Successfully saved \(self.mappings.count) mappings to \(fileURL.path)")
        } catch {
            os_log(.error, log: toolLog, "Error saving mappings to %{public}s: %{public}s", fileURL.path, error.localizedDescription)
            print("Error: Could not save mappings to \(fileURL.path). Details: \(error.localizedDescription)")
        }
    }

    func addMapping(bundleID: String, layoutName: String, appPath: String?, enabled: Bool) {
        mappings.removeAll { $0.bundleIdentifier == bundleID }
        let newMapping = AppLayoutMapping(
            bundleIdentifier: bundleID,
            layoutName: layoutName,
            applicationPath: appPath,
            enabled: enabled
        )
        mappings.append(newMapping)
        saveMappings() // Will print success/failure
        // Redundant print after saveMappings already prints.
        // print("Added/Updated mapping: \(newMapping.description())")
    }

    func listMappings() {
        if mappings.isEmpty {
            print("No mappings defined.")
            return
        }
        print("\n--- Existing Mappings ---")
        for (index, mapping) in mappings.enumerated() {
            print("\(index + 1). \(mapping.description())")
        }
        print("-------------------------\n")
    }

    func removeMapping(bundleID: String) {
        let initialCount = mappings.count
        mappings.removeAll { $0.bundleIdentifier == bundleID }
        if mappings.count < initialCount {
            saveMappings() // Will print success
            print("Info: Removed mapping(s) for bundle ID '\(bundleID)'.")
        } else {
            print("Info: No mapping found for bundle ID '\(bundleID)'. Nothing to remove.")
        }
    }

    func toggleMapping(bundleID: String, enable: Bool) {
        if let index = mappings.firstIndex(where: { $0.bundleIdentifier == bundleID }) {
            mappings[index].enabled = enable
            saveMappings() // Will print success
            print("Info: Mapping for bundle ID '\(bundleID)' is now \(enable ? "enabled" : "disabled").")
        } else {
            print("Info: No mapping found for bundle ID '\(bundleID)' to toggle.")
        }
    }
}

// --- Command Line Argument Parsing ---
let arguments = CommandLine.arguments
let manager = MappingManager()

func printUsageAndExit(success: Bool = false) {
    let execName = URL(fileURLWithPath: CommandLine.arguments[0]).lastPathComponent
    // Using print for CLI output, os_log for background logging
    print("""
    Moom App Layout Mapping Configuration Tool
    ----------------------------------------
    Usage: \(execName) <command> [options]

    Commands:
      add <bundleID> <layoutName> [appPath] [--disabled|--enabled]
                            Adds or updates a mapping.
                            [appPath] is optional.
                            Mappings default to enabled unless --disabled is specified.
                            If --enabled is specified, it ensures the mapping is active.
                            Example: \(execName) add com.apple.TextEdit "My Text Layout" /System/Applications/TextEdit.app
                            Example: \(execName) add com.google.Chrome "Dev Setup" --disabled

      list                  Lists all existing mappings.
                            Example: \(execName) list

      remove <bundleID>     Removes a mapping for the given bundle ID.
                            Example: \(execName) remove com.apple.TextEdit

      enable <bundleID>     Enables an existing mapping for the given bundle ID.
                            Example: \(execName) enable com.google.Chrome

      disable <bundleID>    Disables an existing mapping for the given bundle ID.
                            Example: \(execName) disable com.google.Chrome

      help, --help, -h      Shows this help message.
    """)
    exit(success ? 0 : 1)
}


if arguments.count < 2 {
    printUsageAndExit(success: true)
}

let command = arguments[1].lowercased()

switch command {
case "add":
    guard arguments.count >= 4 else {
        print("Error: Missing bundleID and layoutName for 'add' command.")
        printUsageAndExit()
    }
    let bundleID = arguments[2]
    let layoutName = arguments[3]
    var appPath: String? = nil
    var enabled: Bool = true

    var currentArgIndex = 4
    if arguments.count > currentArgIndex && !arguments[currentArgIndex].starts(with: "--") {
        appPath = arguments[currentArgIndex]
        currentArgIndex += 1
    }

    if arguments.count > currentArgIndex {
        if arguments[currentArgIndex] == "--disabled" {
            enabled = false
        } else if arguments[currentArgIndex] == "--enabled" {
            // enabled is already true by default, this flag makes it explicit
            enabled = true
        } else {
            print("Error: Unknown flag '\(arguments[currentArgIndex])' for 'add' command.")
            printUsageAndExit()
        }
    }
    // Check if there are more arguments than expected
    if arguments.count > currentArgIndex + 1 && arguments[currentArgIndex+1].starts(with: "--") == false {
         print("Error: Too many arguments for 'add' command after path and flags.")
         printUsageAndExit()
    }


    manager.addMapping(bundleID: bundleID, layoutName: layoutName, appPath: appPath, enabled: enabled)

case "list":
    if arguments.count > 2 {
        print("Error: 'list' command takes no additional arguments.")
        printUsageAndExit()
    }
    manager.listMappings()

case "remove":
    guard arguments.count == 3 else {
        print("Error: 'remove' command requires exactly one bundleID argument.")
        printUsageAndExit()
    }
    let bundleIDToRemove = arguments[2]
    manager.removeMapping(bundleID: bundleIDToRemove)

case "enable":
    guard arguments.count == 3 else {
        print("Error: 'enable' command requires exactly one bundleID argument.")
        printUsageAndExit()
    }
    let bundleIDToEnable = arguments[2]
    manager.toggleMapping(bundleID: bundleIDToEnable, enable: true)

case "disable":
    guard arguments.count == 3 else {
        print("Error: 'disable' command requires exactly one bundleID argument.")
        printUsageAndExit()
    }
    let bundleIDToDisable = arguments[2]
    manager.toggleMapping(bundleID: bundleIDToDisable, enable: false)

case "help", "--help", "-h":
    printUsageAndExit(success: true)

default:
    print("Error: Unknown command '\(command)'.")
    printUsageAndExit()
}

// To compile and run (from terminal):
// 1. Save as MappingConfigTool.swift
// 2. swiftc MappingConfigTool.swift -o MoomMappingTool
// 3. ./MoomMappingTool <command> [args...]
```
