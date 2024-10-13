import NIO
import NIOHTTP1
import XcodeGraphGeneratorCore
import Foundation

/// A class responsible for serving a Cytoscape graph over HTTP and providing server control methods.
public final class GraphServer {
    /// The Cytoscape graph data to serve.
    private let cytoscapeGraph: CytoscapeGraph

    /// The server's communication channel.
    private var channel: Channel?

    /// The event loop group to manage the server's event-driven operations.
    private let eventLoopGroup = MultiThreadedEventLoopGroup(numberOfThreads: System.coreCount)

    /// Initializes a new instance of the `GraphServer` with a given Cytoscape graph.
    /// - Parameter cytoscapeGraph: The graph data to be served.
    public init(cytoscapeGraph: CytoscapeGraph) {
        self.cytoscapeGraph = cytoscapeGraph
    }

    /// Starts the HTTP server on localhost at port 8081 and attempts to open the default browser.
    /// The server will serve graph data and handle incoming HTTP requests.
    /// - Throws: An error if the server fails to bind to the specified host and port.
    public func start() throws {
        let bootstrap = createBootstrap(with: cytoscapeGraph)

        do {
            print("Attempting to bind server to localhost:8081")
            self.channel = try bootstrap.bind(host: "localhost", port: 8081).wait()
            print("Server successfully bound to http://localhost:8081")

            // Open the default web browser to the server URL
            openBrowser()

            // Wait for the server to close
            try self.channel?.closeFuture.wait()
        } catch {
            print("Failed to bind server: \(error)")
            try shutdownServer()
            throw error
        }
    }

    /// Shuts down the server gracefully, closing the channel and releasing resources.
    public func shutdown() {
        print("Shutting down the server...")
        do {
            try shutdownServer()
        } catch {
            print("Error shutting down the server: \(error)")
        }
    }

    /// Creates a ServerBootstrap instance configured to handle HTTP requests for the Cytoscape graph.
    /// - Parameter graph: The Cytoscape graph to be served.
    /// - Returns: A configured `ServerBootstrap` instance.
    private func createBootstrap(with graph: CytoscapeGraph) -> ServerBootstrap {
        return ServerBootstrap(group: eventLoopGroup)
            .serverChannelOption(ChannelOptions.backlog, value: 256)
            .serverChannelOption(ChannelOptions.socketOption(.so_reuseaddr), value: 1)
            .childChannelInitializer { channel in
                channel.pipeline.configureHTTPServerPipeline().flatMap {
                    channel.pipeline.addHandler(HTTPHandler(cytoscapeGraph: graph))
                }
            }
            .childChannelOption(ChannelOptions.socketOption(.so_reuseaddr), value: 1)
            .childChannelOption(ChannelOptions.maxMessagesPerRead, value: 1)
    }

    /// Gracefully shuts down the server by closing the channel and shutting down the event loop group.
    /// - Throws: An error if the server fails to shut down properly.
    private func shutdownServer() throws {
        try channel?.close().wait()
        try eventLoopGroup.syncShutdownGracefully()
    }

    /// Opens the default web browser to the URL of the server (`http://localhost:8081`).
    /// The method supports macOS, Linux, and Windows platforms.
    private func openBrowser() {
        let url = URL(string: "http://localhost:8081")!

        #if os(macOS)
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/open")
        process.arguments = [url.absoluteString]
        do {
            try process.run()
        } catch {
            print("Failed to open browser: \(error)")
        }
        #elseif os(Linux)
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/xdg-open")
        process.arguments = [url.absoluteString]
        do {
            try process.run()
        } catch {
            print("Failed to open browser: \(error)")
        }
        #elseif os(Windows)
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "cmd")
        process.arguments = ["/C", "start", url.absoluteString]
        do {
            try process.run()
        } catch {
            print("Failed to open browser: \(error)")
        }
        #endif
    }
}
