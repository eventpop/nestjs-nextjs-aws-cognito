# NestJS + NextJS + AWS Cognito Example

Working example for setting up AWS Cognito for NestJS as backend and NextJS as frontend

## Features

- Authenticate AWS Cognito on NestJS backend, using NextJS as frontend with proxy middleware to prevent CORS & utilize httpOnly cookies.
- GraphQL login with automatic JWT token refresh
- REST login (TODO)

## Setup

- Create AWS Cognito User Pool
- Edit backend .env and add AWS Cognito credentials
- Edit frontend .env and specify urls
- Run both frontend & backend on port 3000 & 4000 respectively

  ```shell
  yarn --cwd frontend-nextjs dev
  yarn --cwd backend-nestjs dev
  ```
