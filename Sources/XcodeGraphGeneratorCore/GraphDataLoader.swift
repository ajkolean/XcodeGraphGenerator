import Foundation
import XcodeGraph
import Path


enum MetadataKey {
    static let path = "Path"
    static let sourceRoot = "Source Root"
    static let xcodeProjPath = "Xcode Project Path"
    static let name = "Name"
    static let isExternal = "Is External"
    static let organizationName = "Organization Name"
    static let classPrefix = "Class Prefix"
    static let defaultKnownRegions = "Default Known Regions"
    static let developmentRegion = "Development Region"
    static let lastUpgradeCheck = "Last Upgrade Check"
    static let packages = "Packages"
    static let targets = "Targets"
    static let schemes = "Schemes"
    static let additionalFiles = "Additional Files"
    static let product = "Product"
    static let bundleID = "Bundle ID"
    static let productName = "Product Name"
    static let dependencies = "Dependencies"
    static let environmentVariables = "Environment Variables"
    static let preBuildScripts = "Pre Build Scripts"
    static let postBuildScripts = "Post Build Scripts"
    static let resources = "Resources"
    static let isRemote = "Is Remote"
    static let url = "URL"
    static let requirement = "Requirement"
    static let localPath = "Local Path"
}

/// Loads and transforms XcodeGraph data into a CytoscapeGraph.
public class GraphDataLoader {
    public init() {}

    /// Loads graph data from a file and transforms it into a CytoscapeGraph.
    /// - Parameter filePath: The path to the JSON file containing the graph data.
    /// - Throws: An error if the file cannot be read or the data cannot be decoded.
    /// - Returns: A CytoscapeGraph ready for visualization.
    public func load(from filePath: String) throws -> CytoscapeGraph {
        let fileURL = URL(fileURLWithPath: filePath)
        guard FileManager.default.fileExists(atPath: fileURL.path) else {
            throw NSError(domain: "GraphDataLoader", code: 1, userInfo: [NSLocalizedDescriptionKey: "File not found at path: \(filePath)"])
        }

        let jsonData = try Data(contentsOf: fileURL)
        let decoder = JSONDecoder()
        let graph = try decoder.decode(XcodeGraph.Graph.self, from: jsonData)

        // Generate nodes and edges
        let (nodes, nodeIds) = createNodes(from: graph)
        let edges = createEdges(from: graph, nodeIds: nodeIds)

        return CytoscapeGraph(nodes: nodes, edges: edges)
    }

    /// Creates Cytoscape nodes from the XcodeGraph structure.
    private func createNodes(from graph: XcodeGraph.Graph) -> ([CytoscapeNode], Set<String>) {
        var nodeSet = Set<String>() // To avoid duplicate nodes
        var cytoscapeNodes: [CytoscapeNode] = []

        // Create project group nodes
        for (path, project) in graph.projects {
            let groupId = "\(NodeClass.projectGroup.rawValue)-\(path.pathString)"
            if nodeSet.insert(groupId).inserted {
                let projectNode = CytoscapeNode(
                    data: NodeData(
                        id: groupId,
                        parent: nil,
                        label: project.name,
                        productType: nil,
                        metadata: collectProjectMetadata(project),
                        nodeType: .project,
                        platforms: Array(Set(project.targets.values.flatMap { $0.destinations.platforms.map(\.rawValue) }))
                    ),
                    classes: .projectGroup
                )
                cytoscapeNodes.append(projectNode)
            }

            // Create nodes for each target within the project
            for (targetName, target) in project.targets {
                let nodeId = "\(NodeType.target.rawValue)-\(path.pathString)-\(targetName)"
                if nodeSet.insert(nodeId).inserted {
                    let targetNode = CytoscapeNode(
                        data: NodeData(
                            id: nodeId,
                            parent: groupId,
                            label: targetName,
                            productType: target.product.caseValue,
                            metadata: collectTargetMetadata(target),
                            nodeType: .target,
                            platforms: Array(Set(target.destinations.map { $0.platform.rawValue }))
                        ),
                        classes: nil
                    )
                    cytoscapeNodes.append(targetNode)
                }
            }
        }

        // Create package group nodes
        for (path, packages) in graph.packages {
            let groupId = "\(NodeClass.packageGroup.rawValue)-\(path.pathString)"
            if nodeSet.insert(groupId).inserted {
                let packageGroupNode = CytoscapeNode(
                    data: NodeData(
                        id: groupId,
                        parent: nil,
                        label: "Packages at \(path.basename)",
                        productType: nil,
                        metadata: collectPackageGroupMetadata(path),
                        nodeType: .package,
                        platforms: Platform.allCases.map { $0.rawValue }
                    ),
                    classes: .packageGroup
                )
                cytoscapeNodes.append(packageGroupNode)
            }

            // Create individual package nodes
            for (packageName, package) in packages {
                let nodeId = "\(NodeType.package.rawValue)-\(path.pathString)-\(packageName)"
                if nodeSet.insert(nodeId).inserted {
                    let packageNode = CytoscapeNode(
                        data: NodeData(
                            id: nodeId,
                            parent: groupId,
                            label: packageName,
                            productType: NodeType.package.rawValue,
                            metadata: collectPackageMetadata(package),
                            nodeType: .package,
                            platforms: Platform.allCases.map { $0.rawValue }
                        ),
                        classes: nil
                    )
                    cytoscapeNodes.append(packageNode)
                }
            }
        }

        return (cytoscapeNodes, nodeSet)
    }

    /// Collects comprehensive metadata for a project, preserving order.
    private func collectProjectMetadata(_ project: Project) -> [MetadataItem] {
        var metadata: [MetadataItem] = [
            MetadataItem(key: "Path", value: project.path.pathString),
            MetadataItem(key: "Source Root", value: project.sourceRootPath.pathString),
            MetadataItem(key: "Xcode Project Path", value: project.xcodeProjPath.pathString),
            MetadataItem(key: "Is External", value: project.isExternal ? "Yes" : "No")
        ]

        // Add optional values if available
        if let orgName = project.organizationName {
            metadata.append(MetadataItem(key: "Organization Name", value: orgName))
        }
        if let classPrefix = project.classPrefix {
            metadata.append(MetadataItem(key: "Class Prefix", value: classPrefix))
        }
        if let defaultKnownRegions = project.defaultKnownRegions {
            metadata.append(MetadataItem(key: "Default Known Regions", value: defaultKnownRegions.joined(separator: ", ")))
        }
        if let developmentRegion = project.developmentRegion {
            metadata.append(MetadataItem(key: "Development Region", value: developmentRegion))
        }
        if let lastUpgradeCheck = project.lastUpgradeCheck {
            metadata.append(MetadataItem(key: "Last Upgrade Check", value: lastUpgradeCheck.description))
        }

        // Collect information about targets
        if !project.targets.isEmpty {
            let targetNames = project.targets.keys.joined(separator: ", ")
            metadata.append(MetadataItem(key: "Targets", value: targetNames))
        }

        // Collect information about schemes
        if !project.schemes.isEmpty {
            let schemeNames = project.schemes.map { $0.name }.joined(separator: ", ")
            metadata.append(MetadataItem(key: "Schemes", value: schemeNames))
        }

        // Collect additional files
        if !project.additionalFiles.isEmpty {
            metadata.append(MetadataItem(key: "Additional Files", value: project.additionalFiles.map { $0.path.pathString }.joined(separator: ", ")))
        }

        return metadata
    }


    /// Collects comprehensive metadata for a target.
    private func collectTargetMetadata(_ target: Target) -> [MetadataItem] {
        var metadata: [MetadataItem] = [
            MetadataItem(key: MetadataKey.product, value: target.product.caseValue),
            MetadataItem(key: MetadataKey.bundleID, value: target.bundleId),
            MetadataItem(key: MetadataKey.productName, value: target.productName)
        ]

        // Include dependencies if present
        if !target.dependencies.isEmpty {
            let dependencies = target.dependencies.map { "\($0.name)" }.joined(separator: ", ")
            metadata.append(MetadataItem(key: MetadataKey.dependencies, value: dependencies))
        }

        // Include environment variables if present
        if !target.environmentVariables.isEmpty {
            let environmentVariables = target.environmentVariables.map { "\($0.key): \($0.value)" }.joined(separator: ", ")
            metadata.append(MetadataItem(key: MetadataKey.environmentVariables, value: environmentVariables))
        }

        // Include pre and post build scripts if present
        if !target.preScripts.isEmpty {
            let preBuildScripts = target.preScripts.map { "\($0.name)" }.joined(separator: ", ")
            metadata.append(MetadataItem(key: MetadataKey.preBuildScripts, value: preBuildScripts))
        }
        if !target.postScripts.isEmpty {
            let postBuildScripts = target.postScripts.map { "\($0.name)" }.joined(separator: ", ")
            metadata.append(MetadataItem(key: MetadataKey.postBuildScripts, value: postBuildScripts))
        }

        return metadata
    }

    /// Collects comprehensive metadata for a package group.
    private func collectPackageGroupMetadata(_ path: AbsolutePath) -> [MetadataItem] {
        return [
            MetadataItem(key: MetadataKey.path, value: path.pathString),
            MetadataItem(key: MetadataKey.name, value: "Packages at \(path.basename)")
        ]
    }

    /// Collects comprehensive metadata for a package.
    private func collectPackageMetadata(_ package: Package) -> [MetadataItem] {
        var metadata: [MetadataItem] = [
            MetadataItem(key: MetadataKey.isRemote, value: package.isRemote.description)
        ]

        // Add metadata for remote packages
        switch package {
        case .remote(let url, let requirement):
            metadata.append(MetadataItem(key: MetadataKey.url, value: url))
            metadata.append(MetadataItem(key: MetadataKey.requirement, value: requirementDescription(requirement)))

        // Add metadata for local packages
        case .local(let path):
            metadata.append(MetadataItem(key: MetadataKey.localPath, value: path.pathString))
        }

        return metadata
    }


    /// Converts the package requirement into a readable description.
    private func requirementDescription(_ requirement: Requirement) -> String {
        switch requirement {
        case .upToNextMajor(let version):
            return "Up to next major \(version)"
        case .upToNextMinor(let version):
            return "Up to next minor \(version)"
        case .range(let from, let to):
            return "Range \(from) to \(to)"
        case .exact(let version):
            return "Exact version \(version)"
        case .branch(let branchName):
            return "Branch \(branchName)"
        case .revision(let revision):
            return "Revision \(revision)"
        }
    }

    /// Creates Cytoscape edges from the XcodeGraph structure.
    private func createEdges(from graph: XcodeGraph.Graph, nodeIds: Set<String>) -> [CytoscapeEdge] {
        var cytoscapeEdges: [CytoscapeEdge] = []

        for (fromDependency, toDependencies) in graph.dependencies {
            let sourceId = fromDependency.nodeId
            guard nodeIds.contains(sourceId) else { continue }

            for toDependency in toDependencies {
                let targetId = toDependency.nodeId
                guard nodeIds.contains(targetId) else { continue }
                let edgeData = EdgeData(
                    source: sourceId,
                    target: targetId
                )
                cytoscapeEdges.append(CytoscapeEdge(data: edgeData))
            }
        }

        return cytoscapeEdges
    }
}

/// Extension to simplify node ID generation.
private extension GraphDependency {
    /// Generates a unique node ID based on the dependency type.
    var nodeId: String {
        switch self {
        case .target(let name, let path, _):
            return "\(NodeType.target.rawValue)-\(path.pathString)-\(name)"
        case .xcframework(let xcframework):
            return "\(NodeType.package.rawValue)-\(xcframework.path.pathString)"
        case .framework(let path, _, _, _, _, _, _):
            return "\(NodeType.package.rawValue)-\(path.pathString)"
        case .library(let path, _, _, _, _):
            return "\(NodeType.package.rawValue)-\(path.pathString)"
        case .bundle(let path):
            return "\(NodeType.package.rawValue)-\(path.pathString)"
        case .packageProduct(let path, let product, _):
            return "\(NodeType.package.rawValue)-\(path.pathString)-\(product)"
        case .sdk(let name, let path, _, _):
            return "\(NodeType.package.rawValue)-\(path.pathString)-\(name)"
        case .macro(let path):
            return "\(NodeType.package.rawValue)-\(path.pathString)"
        }
    }
}

extension TargetDependency {
    /// Returns a human-readable name or product for the dependency, depending on the case.
    public var name: String {
        switch self {
        case .target(name: let targetName, _, _):
            return targetName
        case .project(target: let projectName, _, _, _):
            return projectName
        case .framework(path: let frameworkPath, _, _):
            return frameworkPath.basenameWithoutExt
        case .xcframework(path: let xcframeworkPath, _, _):
            return xcframeworkPath.basenameWithoutExt
        case .library(path: let libraryPath, _, _, _):
            return libraryPath.basenameWithoutExt
        case .package(product: let productName, _, _):
            return productName
        case .sdk(name: let sdkName, _, _):
            return sdkName
        case .xctest:
            return "XCTest"
        }
    }
}
