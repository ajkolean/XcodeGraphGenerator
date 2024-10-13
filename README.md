# XcodeGraphGenerator

**XcodeGraphGenerator** is a Swift-based tool that generates a visual graph of Xcode project dependencies and serves it through a web interface. This tool leverages **SwiftNIO** to provide an HTTP server that serves the project graph in **Cytoscape.js** format, making it easy to visualize and explore Xcode project dependencies.

## Preview

https://ajkolean.github.io/XcodeGraphGenerator/

## Features

- Parses Xcode projects and packages using **XcodeGraph**.
- Generates a directed acyclic graph (DAG) representing Xcode project dependencies.
- Serves the graph and other static assets (HTML, JS, CSS) using a lightweight HTTP server built on **SwiftNIO**.
- Automatically opens the browser and provides an interactive visualization of the graph using **Cytoscape.js**.
- Cross-platform support for macOS, Linux, and Windows.

## Installation

### Prerequisites
- Swift 5.7+ is required.
- Xcode must be installed for macOS users.

### Build the Project
To build the project, clone the repository and use **Swift Package Manager** (SPM):

```bash
git clone https://github.com/ajkolean/XcodeGraphGenerator.git
cd XcodeGraphGenerator
swift build
```

### Run the Executable
Once the build is complete, you can run the tool:

```bash
swift run XcodeGraphGenerator /path/to/graph.json
```

Replace `/path/to/graph.json` with the path to your generated `graph.json` file, which contains the dependency graph data for your Xcode project.

## Usage

The tool starts a local HTTP server to visualize the dependency graph. The default address is `http://localhost:8081`. After running the tool, the web browser will open automatically and load the interactive visualization of the Xcode project dependencies.

### Example Command
```bash
swift run XcodeGraphGenerator /Users/username/Projects/MyApp/graph.json
```

### Graph JSON Structure

The `graph.json` file should conform to the `XcodeGraph.Graph` structure, which is a **Codable** representation of the Xcode project and its dependencies. This structure includes:

- **name**: The name of the graph.
- **path**: The path where the graph has been loaded from.
- **projects**: A dictionary of projects, with their paths as keys and project data as values.
- **packages**: A dictionary of Swift packages, associated with their respective projects.
- **dependencies**: A dictionary representing the relationships between different targets or frameworks in the project.
- **dependencyConditions**: A dictionary that specifies platform conditions for dependencies.

The `XcodeGraph.Graph` structure is critical for properly generating the project dependency graph.

### Serving Static Files

The server also serves static files (HTML, CSS, JS) from the `public` directory, making it easy to customize the interface or add additional features.

## Package Structure

```
.
├── Sources
│   ├── XcodeGraphGenerator           # Main executable target
│   ├── XcodeGraphGeneratorCore       # Core logic for handling Xcode graph data
│   ├── XcodeGraphGeneratorServer     # HTTP server logic using SwiftNIO
│   └── Resources
│       └── public                    # Static assets (index.html, JS, CSS) for the web interface
├── Tests                             # Unit tests
├── README.md                         # This README file
└── Package.swift                     # Swift Package Manager configuration
```

## Development

### Dependencies

The project relies on several dependencies:
- **SwiftNIO**: For handling networking and building the HTTP server.
- **XcodeGraph**: For parsing Xcode projects and generating the dependency graph.
- **Swift Argument Parser**: For handling command-line arguments.

These dependencies are specified in the `Package.swift` file.

### Modify or Extend

To modify the static web interface, edit the files in the `Resources/public` directory. For core functionality, the logic is split between `XcodeGraphGeneratorCore` (parsing, graph generation) and `XcodeGraphGeneratorServer` (HTTP server, static file handling).

## Acknowledgments

- **Cytoscape.js**: For providing a flexible and powerful graph visualization library.
- **SwiftNIO**: For the robust networking foundation.
- **XcodeGraph**: For simplifying the process of parsing Xcode projects.

---

