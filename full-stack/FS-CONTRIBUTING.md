<!-- markdownlint-disable MD033 -->
# FullStack Contributing

<br>
<div style="width: 100%; height: 12px; background-color: grey; border-radius: 3px;">
</div>
<br>

>
>
>
><!-- markdownlint-disable MD033 -->
><p style="color: #f8f8ff; background-color: #429abe; font-size: 24px; font-family: Arial, sans-serif; padding: 14px; border-radius: 4px; text-align: center; border: 2px solid black;">
>  Code Quality
></p>
>
>## Prettier
>
>Prettier is a opinionated code formatter. It removes all original styling during development and ensures that it stays consistent with the current code base styling. Any styling done by prettier is done so following the [.prettierrc](.prettierrc) and [.prettierignore](.prettierignore) configuration files. Current files can be modified using the [CLI](https://prettier.io/docs/cli) commands. To have Prettier be handled automatically on your respective IDE on saves go to the [Prettier Editor Docs](https://prettier.io/docs/editors) and follow their instructions.
>
>[CI Setup](https://prettier.io/docs/ci)
>
> To run these commands do so in [/full-stack/src](/full-stack/src/)
>
> Verify `npm run prettier:verify`
>
> Format `npm run prettier:format`
>
>## ESLint
>
>ESLint statically analyzes code to quickly find problems. Many problems ESLint finds can be automatically fixed however there are some that are unfixable which needs to be dealt with manually. Custom rules for both the Vite React Web Application and the Node Express API server. Styling is done differently in both the <b>web-client</b> and the <b>server</b>. Any additional rules added to the web-client or api server needs to be done in their respective configuration files.
>
> <b>server</b> configuration [eslint.config.mjs](/full-stack/src/server/eslint.config.mjs)
>
> <b>web-client</b> configuration [eslint.config.js](/full-stack/src/web-client/eslint.config.js)
>
> To run the below command do so in [/full-stack/src](/full-stack/src/) 
>
> Verify `npm run lint:all`
>
><b>Note:</b> the package json of each file directory has their own lint commnad use those if working on them seperately
>
>
>---

<br>
<div style="width: 100%; height: 12px; background-color: grey; border-radius: 3px;">
</div>
<br>

>
>
>
><p style="color: #f8f8ff; background-color: #429abe; font-size: 24px; font-family: Arial, sans-serif; padding: 14px; border-radius: 4px; text-align: center; border: 2px solid black;">
>  Getting Started
></p>
>
>1. Fork the repository
>2. Clone the forked repository onto your machine
>3. Checkout or create a branch off of the `dev/fullstack` branch this is where all development occurs
>4. Create an Github Issue following the rules, reading the instructions, and copy pasting the template [ISSUES](/ISSUES.md) and fill it out to the best of your ability.
>5. Once finished with the issues make sure linting and prettier pass otherwise they will be flagged during the PR and will be rejected.
>6. Now create the PR request following the rules, instructions, and copy paste the template at [PR.md](/PR.md) and fill it out to the best of your ability.
>
>Additonal Notes:
>
>- If you create your own branch just make sure its pushed into `dev/fullstack` as its the only branch push requests will be accepted
>
>- We reccomend fixing linting errors and warning first before running prettier
>
>
>---

<br>
<div style="width: 100%; height: 12px; background-color: grey; border-radius: 3px;">
</div>
<br>

>
>
>
><p style="color: #f8f8ff; background-color: #429abe; font-size: 24px; font-family: Arial, sans-serif; padding: 14px; border-radius: 4px; text-align: center; border: 2px solid black;">
>  Running The Application
></p>
>
>
>Using scripts from the [package.json](./src/package.json) in the [src](./src) directory. So ensure this is where you are located when running these commands.
>
>Individual package.json scripts exist in their respective folders (workspace) for the [server](./src/server/) and [web-client](./src/web-client/) to run them seperately
>
>### Development
>
>Start development process by using these two scripts
>
>1. Member view `npm run dev-member:start`
>
>2. Admin view `npm run dev-admin:start`
>
>
>### Builds
>
>Builds are placed into the [dist](/dist/) folder at the root of [full-stack](./).
>
>- Create: by using the script `npm run build:all`
>- Clean:  by using the script `npm run clean-build:all`
>- Start:  by using the script `npm run start-build`
>- To configure the <b>server</b> builds options Use the [build.mjs](./src/server/build.mjs)
>- To configure the <b>web client</b> builds options Use the [vite.config.js](./src/web-client/vite.config.js)

