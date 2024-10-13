// Define constants for node classes
public enum NodeClass: String {
    case projectGroup = "projectGroup"
    case packageGroup = "packageGroup"
    case target = "target"
}

// Enum for node types (target, package, etc.)
public enum NodeType: String, Codable, Sendable {
    case target
    case package
    case project
    case unknown
}

/// A struct to represent a key-value pair for metadata
public struct MetadataItem: Codable, Sendable  {
    let key: String
    let value: String
}


// CytoscapeGraph structure conforming to Codable and Sendable
public struct CytoscapeGraph: Codable, Sendable {
    let nodes: [CytoscapeNode]
    let edges: [CytoscapeEdge]
}

// CytoscapeNode structure conforming to Codable and Sendable
public struct CytoscapeNode: Codable, Sendable {
    public let data: NodeData
    public let classes: String? // Optional class for styling purposes

    public init(data: NodeData, classes: NodeClass? = nil) {
        self.data = data
        self.classes = classes?.rawValue
    }
}

// NodeData structure conforming to Codable and Sendable
public struct NodeData: Codable, Sendable {
    public let id: String
    public let parent: String?
    public let label: String?
    public let productType: String?
    public let metadata: [MetadataItem]
    public let nodeType: NodeType // To distinguish between target, package, project, etc.
    public let platforms: [String]? // Platforms array

    public init(
        id: String,
        parent: String? = nil,
        label: String? = nil,
        productType: String? = nil,
        metadata: [MetadataItem] = [],
        nodeType: NodeType = .unknown,
        platforms: [String]? = nil
    ) {
        self.id = id
        self.parent = parent
        self.label = label
        self.productType = productType
        self.metadata = metadata
        self.nodeType = nodeType
        self.platforms = platforms
    }
}

// CytoscapeEdge structure conforming to Codable and Sendable
public struct CytoscapeEdge: Codable, Sendable {
    public let data: EdgeData

    public init(data: EdgeData) {
        self.data = data
    }
}

// EdgeData structure conforming to Codable and Sendable
public struct EdgeData: Codable, Sendable {
    public let source: String
    public let target: String

    public init(source: String, target: String) {
        self.source = source
        self.target = target
    }
}
