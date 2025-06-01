import Cocoa
import os.log

// Define an OSLog subsystem and category for this component
private let log = OSLog(subsystem: Bundle.main.bundleIdentifier ?? "com.example.Moom4", category: "AppLaunchDetector")

// This AppLaunchDetector is the one used by LayoutAutomator (takes a handler)
class AppLaunchDetector {
    typealias LaunchHandler = (NSRunningApplication) -> Void
    private var launchHandler: LaunchHandler

    init(launchHandler: @escaping LaunchHandler) {
        self.launchHandler = launchHandler
        NSWorkspace.shared.notificationCenter.addObserver(
            self,
            selector: #selector(appDidLaunch(notification:)),
            name: NSWorkspace.didLaunchApplicationNotification,
            object: nil
        )
        os_log(.info, log: log, "AppLaunchDetector initialized and subscribed to didLaunchApplicationNotification.")
    }

    deinit {
        NSWorkspace.shared.notificationCenter.removeObserver(self)
        os_log(.info, log: log, "AppLaunchDetector deinitialized and unsubscribed from notifications.")
    }

    @objc private func appDidLaunch(notification: Notification) {
        os_log(.debug, log: log, "Received didLaunchApplicationNotification.")

        guard let app = notification.userInfo?[NSWorkspace.applicationKey] as? NSRunningApplication else {
            os_log(.error, log: log, "Could not extract NSRunningApplication from notification's userInfo dictionary.")
            return
        }

        let bundleID = app.bundleIdentifier ?? "N/A"
        let appName = app.localizedName ?? "N/A"
        os_log(.info, log: log, "Application launched: Name='%{public}s', BundleID='%{public}s', PID=%d", appName, bundleID, app.processIdentifier)

        // Call the provided handler
        launchHandler(app)
    }
}

// Note: The original AppLaunchDetector.swift content (without the handler parameter)
// was simpler. The version being modified here is the one designed to be used
// by LayoutAutomator.swift, which accepts a callback.
// If a standalone AppLaunchDetector is also needed, it would be a separate definition
// or this one would be made more flexible. For this task, we assume this is the
// primary version used by the system we're building.
