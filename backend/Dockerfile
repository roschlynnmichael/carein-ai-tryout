   # Use an official Python runtime as a parent image
   FROM python:3.11-slim

   # Set environment variables for Python
   ENV PYTHONDONTWRITEBYTECODE 1
   ENV PYTHONUNBUFFERED 1

   # Set the working directory in the container
   WORKDIR /app

   # Install system dependencies if any (e.g., for certain Python packages)
   # RUN apt-get update && apt-get install -y --no-install-recommends some-package

   # Copy the requirements file into the container at /app
   COPY requirements.txt .

   # Install any needed packages specified in requirements.txt
   RUN pip install --no-cache-dir --upgrade pip && \
       pip install --no-cache-dir -r requirements.txt

   # Copy the rest of the application code into the container at /app
   COPY ./app ./app

   # Expose the port the app runs on
   # This should match the port Uvicorn will listen on
   EXPOSE 5005

   # Define the command to run your application
   # Ensure your .env variables like OPENAI_API_KEY are passed at runtime
   # For development, Uvicorn's --host 0.0.0.0 makes it accessible from outside the container
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5005"]