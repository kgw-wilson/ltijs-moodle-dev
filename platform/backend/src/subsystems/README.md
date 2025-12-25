# Backend Architecture

The backend is organized into subsystems, each with a clear layer of responsibility:

- Controller Layer: Handles HTTP requests, translates them into service calls, and performs error handling.

- Service Layer: Contains the core business logic. This layer should be the largest, others should be small. Unit tests should be around this layer.

- Persistence Layer: Maps service-level operations to data operations.

- Data Layer: Interacts directly with the database or external systems.

Each layer may only depend on the one directly below it (e.g., controllers → services → persistence → data).

Subsystems follow a public/private structure:

- public/ files can be imported by other subsystems.

- private/ files should only be used internally within the subsystem.
