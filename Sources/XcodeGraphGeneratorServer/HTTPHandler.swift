import NIO
import NIOHTTP1
import Foundation
import XcodeGraphGeneratorCore

class HTTPHandler: ChannelInboundHandler {
    typealias InboundIn = HTTPServerRequestPart
    typealias OutboundOut = HTTPServerResponsePart

    private let cytoscapeGraph: CytoscapeGraph
    private let bundle: Bundle

    init(cytoscapeGraph: CytoscapeGraph, bundle: Bundle = .module) {
        self.cytoscapeGraph = cytoscapeGraph
        self.bundle = bundle
    }

    func channelRead(context: ChannelHandlerContext, data: NIOAny) {
        let reqPart = self.unwrapInboundIn(data)

        switch reqPart {
        case .head(let request):
            handleRequest(context: context, request: request)
        case .body, .end:
            break
        }
    }

    func channelReadComplete(context: ChannelHandlerContext) {
        context.flush()
    }

    /// Handles different types of requests based on URI
    private func handleRequest(context: ChannelHandlerContext, request: HTTPRequestHead) {
        print("Received request for URI: \(request.uri)")

        switch request.uri {
        case "/":
            // Serve index.html from the bundle
            if let filePath = bundle.path(forResource: "index", ofType: "html", inDirectory: "public") {
                serveStaticFile(context: context, request: request, filePath: filePath, contentType: "text/html")
            } else {
                sendError(context: context, request: request, status: .notFound)
            }
        case "/graph.json":
            serveGraphJSON(context: context, request: request)
        default:
            serveStaticOrSendNotFound(context: context, request: request)
        }
    }

    /// Serves the `graph.json` file with encoded graph data
    private func serveGraphJSON(context: ChannelHandlerContext, request: HTTPRequestHead) {
        do {
            let encoder = JSONEncoder()
            encoder.outputFormatting = .prettyPrinted
            let jsonData = try encoder.encode(cytoscapeGraph)

            serveData(context: context, request: request, data: jsonData, contentType: "application/json")

                        // Optionally, you can write the JSON data to a file
            // Get the URL for the temporary directory
             let tempDirectory = FileManager.default.temporaryDirectory

             // Create a unique file name in the temporary directory
             let fileURL = tempDirectory.appendingPathComponent("graph.json")

             // Write the data to the temporary file
             try jsonData.write(to: fileURL)

             // Print the file URL
             print("Graph data written to temporary file: \(fileURL)")
        } catch {
            sendError(context: context, request: request, status: .internalServerError)
        }
    }

    /// Serves static files or sends a 404 error if the file is not found
    private func serveStaticOrSendNotFound(context: ChannelHandlerContext, request: HTTPRequestHead) {
        let requestedPath = request.uri.trimmingCharacters(in: CharacterSet(charactersIn: "/"))

        if let filePath = bundle.path(forResource: requestedPath, ofType: nil, inDirectory: "public") {
            let contentType = contentTypeForExtension(fileExtension: (request.uri as NSString).pathExtension)
            serveStaticFile(context: context, request: request, filePath: filePath, contentType: contentType)
        } else {
            sendError(context: context, request: request, status: .notFound)
        }
    }

    /// Serves a static file from the bundle
    private func serveStaticFile(context: ChannelHandlerContext, request: HTTPRequestHead, filePath: String, contentType: String) {
        do {
            let fileData = try Data(contentsOf: URL(fileURLWithPath: filePath))
            serveData(context: context, request: request, data: fileData, contentType: contentType)
        } catch {
            sendError(context: context, request: request, status: .internalServerError)
        }
    }

    /// Sends the data as part of the response
    private func serveData(context: ChannelHandlerContext, request: HTTPRequestHead, data: Data, contentType: String) {
        var headers = HTTPHeaders()
        headers.add(name: "content-type", value: contentType)

        let responseHead = HTTPServerResponsePart.head(
            HTTPResponseHead(version: request.version, status: .ok, headers: headers)
        )
        context.write(self.wrapOutboundOut(responseHead), promise: nil)

        let responseBody = HTTPServerResponsePart.body(.byteBuffer(ByteBuffer(bytes: data)))
        context.write(self.wrapOutboundOut(responseBody), promise: nil)

        let responseEnd = HTTPServerResponsePart.end(nil)
        context.write(self.wrapOutboundOut(responseEnd), promise: nil)
    }

    /// Sends an error response with the given HTTP status
    private func sendError(context: ChannelHandlerContext, request: HTTPRequestHead, status: HTTPResponseStatus) {
        var headers = HTTPHeaders()
        headers.add(name: "content-type", value: "text/plain")

        let responseHead = HTTPServerResponsePart.head(
            HTTPResponseHead(version: request.version, status: status, headers: headers)
        )
        context.write(self.wrapOutboundOut(responseHead), promise: nil)

        let responseBody = HTTPServerResponsePart.body(.byteBuffer(ByteBuffer(string: "\(status.code) \(status.reasonPhrase)")))
        context.write(self.wrapOutboundOut(responseBody), promise: nil)

        let responseEnd = HTTPServerResponsePart.end(nil)
        context.write(self.wrapOutboundOut(responseEnd), promise: nil)
    }

    /// Returns the content type for a given file extension
    private func contentTypeForExtension(fileExtension: String) -> String {
        switch fileExtension.lowercased() {
        case "html":
            return "text/html"
        case "css":
            return "text/css"
        case "js":
            return "application/javascript"
        case "json":
            return "application/json"
        case "png":
            return "image/png"
        case "jpg", "jpeg":
            return "image/jpeg"
        case "gif":
            return "image/gif"
        default:
            return "application/octet-stream"
        }
    }
}
