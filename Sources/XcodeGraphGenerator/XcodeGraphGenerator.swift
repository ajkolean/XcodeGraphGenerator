import ArgumentParser
import XcodeGraphGeneratorCore
import XcodeGraphGeneratorServer
import Foundation

@main
struct XcodeGraphGenerator: ParsableCommand {
    @Argument(help: "Path to the graph.json file.")
    var jsonFilePath: String

    func run() throws {
        // Check if the provided file path exists
        guard FileManager.default.fileExists(atPath: jsonFilePath) else {
            print("Error: File not found at path: \(jsonFilePath)")
            throw ExitCode.failure
        }

        // Load the graph data from the provided JSON file
        let loader = GraphDataLoader()
        let cytoscapeGraph = try loader.load(from: jsonFilePath)

        // Start the SwiftNIO server to serve the graph data and the HTML
        let server = GraphServer(cytoscapeGraph: cytoscapeGraph)

        do {
            try server.start()
        } catch {
            print("Error: Failed to start server - \(error.localizedDescription)")
            throw ExitCode.failure
        }

        // Keep the main thread alive to allow the server to run indefinitely
        dispatchMain()
    }
}
