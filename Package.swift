// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "XcodeGraphGenerator",
    platforms: [
        .macOS(.v13)
    ],
    products: [
        .executable(
            name: "XcodeGraphGenerator",
            targets: ["XcodeGraphGenerator"]
        ),
        .library(
            name: "XcodeGraphGeneratorCore",
            targets: ["XcodeGraphGeneratorCore"]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-nio.git", from: "2.74.0"),
        .package(url: "https://github.com/tuist/XcodeGraph.git", from: "0.3.1"),
        .package(url: "https://github.com/apple/swift-argument-parser.git", from: "1.3.0"),
    ],
    targets: [
        .executableTarget(
            name: "XcodeGraphGenerator",
            dependencies: [
                "XcodeGraphGeneratorCore",
                "XcodeGraphGeneratorServer",
                .product(name: "ArgumentParser", package: "swift-argument-parser")
            ]
        ),
        .target(
            name: "XcodeGraphGeneratorCore",
            dependencies: [
                .product(name: "XcodeGraph", package: "XcodeGraph"),
            ]
        ),
        .target(
            name: "XcodeGraphGeneratorServer",
            dependencies: [
                .product(name: "NIO", package: "swift-nio"),
                .product(name: "NIOHTTP1", package: "swift-nio"),
                .product(name: "NIOFoundationCompat", package: "swift-nio"),
                "XcodeGraphGeneratorCore"
            ],
            resources: [
                .copy("Resources/public")
            ]
        )
    ]
)
