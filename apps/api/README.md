# TICKETGATE DASHBOARD

* I need to find a better name *

This is a laravel project

## Setup

1. Install composer (https://getcomposer.org/doc/00-intro.md)
2. Install bun (https://bun.sh/)
    - macos: `curl -fsSL https://bun.sh/install | bash`
    - windows: `powershell -c "irm bun.sh/install.ps1 | iex"`
3. Run `composer install`
4. Run `bun install`

To run the project, run `docker-compose up`

Make sure to generate a key by running `docker-compose exec app php artisan key:generate`

You probably need to test data to work with so run: 
`docker-compose exec app php artisan migrate:fresh --seed`

This will give you a user with the following credentials:
- email: `test@example.com`
- password: `password`