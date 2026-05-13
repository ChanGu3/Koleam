# FullStack Contributing

## Prettier

Prettier is a opinionated code formatter. It removes all original styling during development and ensures that it stays consistent with the current code base styling. Any styling done by prettier is done so following the [.prettierrc](.prettierrc) and [.prettierignore](.prettierignore) configuration files. Current files can be modified using the [CLI](https://prettier.io/docs/cli) commands. To have Prettier be handled automatically on your respective IDE on saves go to the [Prettier Editor Docs](https://prettier.io/docs/editors) and follow their instructions.

- [CI Setup](https://prettier.io/docs/ci)

## Running Application

Using scripts can be ru from the [package.json](./src/package.json) in the [src](./src) directory

- Individual package.json scripts exist in their respective folders (workspace) for the [server](./src/server/) and [web-client](./src/web-client/) to run them seperately

### Development

Start development process by using the script `npm run dev`

### Builds

Builds are placed into the [dist](/dist/) folder at the root of [full-stack](./).

- Create: by using the script `npm run create-build`
- Clean:  by using the script `npm run clean-build`
- Start:  by using the script `npm run start-build`

#### server

- Use the [build.mjs](./src/server/build.mjs) to configure the build options

#### web-client

- Use the [vite.config.js](./src/web-client/vite.config.js) to configure the build options
