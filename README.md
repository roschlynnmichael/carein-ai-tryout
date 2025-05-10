# carein-ai-tryout


## Prerequisites

Before you begin, ensure you have the following installed:
*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)
*   An [OpenAI API Key](https://platform.openai.com/account/api-keys)

## Setup and Running the Application

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Configure Backend Environment Variables:**
    *   Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    *   Create a `.env` file by copying the example:
        ```bash
        cp .env.example .env
        ```
        (If `.env.example` doesn't exist, create `.env` manually)
    *   Open the `.env` file and add your OpenAI API key:
        ```env
        OPENAI_API_KEY=sk-your_actual_openai_api_key_here
        DATABASE_URL=sqlite:////app/carein.db
        ```
        **Note:** The `DATABASE_URL` is set for the path inside the Docker container.

3.  **Build and Run with Docker Compose:**
    *   Navigate back to the **root directory** of the project (where `docker-compose.yml` is located).
    *   Run the following command to build the Docker images and start the services:
        ```bash
        docker-compose up --build
        ```
    *   This command will:
        *   Build the Docker image for the backend service.
        *   Build the Docker image for the frontend service.
        *   Start both containers.
        *   Create a Docker volume for persistent SQLite database storage for the backend.

4.  **Accessing the Application:**
    *   **Frontend Dashboard:** Open your browser and go to `http://localhost:3000`
    *   **Backend API Documentation (Swagger UI):** Open your browser and go to `http://localhost:5005/docs`

## Development Notes

*   **Backend API:**
    *   The backend listens on port `5005` inside its container, mapped to port `5005` on the host.
    *   The SQLite database file (`carein.db`) is stored in a Docker volume named `carein-ai-tryout_backend_db_data` (the prefix might vary slightly based on your root folder name) to ensure data persistence across container restarts.
*   **Frontend Application:**
    *   The frontend Next.js app listens on port `3000` inside its container, mapped to port `3000` on the host.
    *   It communicates with the backend service using the URL `http://backend:5005/api/v1` (Docker Compose provides service discovery, so `backend` resolves to the backend container's IP). This is configured via the `NEXT_PUBLIC_API_BASE_URL` environment variable in `docker-compose.yml`.
*   **CORS:** The backend is configured to allow requests from `http://localhost:3000` (the frontend's origin when accessed from the host browser).

## Stopping the Application

*   To stop the running services, press `Ctrl+C` in the terminal where `docker-compose up` is running.
*   To stop and remove the containers (but keep the database volume):
    ```bash
    docker-compose down
    ```
*   To stop, remove containers, AND remove the database volume (all data will be lost):
    ```bash
    docker-compose down -v
    ```

## Further Potential Enhancements (Beyond Scope of Challenge)

*   More sophisticated UI/UX animations and transitions.
*   Implementing toast notifications for user feedback.
*   Adding loading skeletons for a smoother UI.
*   User authentication.
*   Pagination for very long lists of summaries.
*   More robust error handling and logging.
*   Switching to PostgreSQL for the database in a production scenario.
*   Setting up a CI/CD pipeline for automated builds and deployments.

---