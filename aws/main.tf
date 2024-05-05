resource "aws_cognito_user_pool" "user_pool" {
  name = "users_restaurante"
}

resource "aws_cognito_user_pool_domain" "main" {
  domain          = "login-restaurante-fiap3"
  user_pool_id    = aws_cognito_user_pool.user_pool.id
}

resource "aws_cognito_user_pool_client" "user_pool_client" {
  name                     = "user_pool_client"
  user_pool_id             = aws_cognito_user_pool.user_pool.id
  generate_secret          = true
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows      = ["code", "implicit"]
  allowed_oauth_scopes     = ["openid", "email", "profile"]
  callback_urls            = ["https://example.com/callback"]
  logout_urls              = ["https://example.com/logout"]
  supported_identity_providers = ["COGNITO"]
  explicit_auth_flows      =  ["ALLOW_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]

}

resource "aws_cognito_user" "default_user" {
  user_pool_id = aws_cognito_user_pool.user_pool.id
  username     = "fiap"
  password = "Fase!324"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "${path.module}/lambda.zip"
  source_dir  = "${path.module}/..cd ./lambda"
}

resource "aws_lambda_function" "autenticacao-lb" {
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  function_name = "login"
  role          = var.role
  handler       = "lambda.handler"
  runtime       = "nodejs18.x"

  # Define as variáveis de ambiente
  environment {
    variables = {
      USER_POOL_ID   = aws_cognito_user_pool.user_pool.id
      CLIENT_ID      = aws_cognito_user_pool_client.user_pool_client.id
      COGNITO_DOMAIN = aws_cognito_user_pool_domain.main.id
    }
  }
}

output "lambda_function_arn" {
  value = aws_lambda_function.autenticacao-lb.arn
}

locals {
  user_pool_id     = aws_cognito_user_pool.user_pool.id
  client_id        = aws_cognito_user_pool_client.user_pool_client.id
  cognito_domain   = aws_cognito_user_pool_domain.main.id
}

output "user_pool_id" {
  value = local.user_pool_id
}

output "client_id" {
  value = local.client_id
}

output "cognito_domain" {
  value = local.cognito_domain
}