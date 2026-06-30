const minimist = require("minimist")
const argv = minimist(process.argv.slice(2))
const isDev = argv.dev === true || argv.d === true
const { Logging } = require("../server-logging.cjs")
const { uploads } = require("../server-uploads.cjs")
const { Sequelize } = require("sequelize")
const { Member } = require("./User/member.cjs")
const { Admin } = require("./User/admin.cjs")
const { Session } = require("./User/session.cjs")
const { Title } = require("./Titles/title.cjs")
const { Genre } = require("./Titles/genre.cjs")
const { TitleGenre } = require("./Titles/title-genre.cjs")
const { TitleOtherTranslation } = require("./Titles/title-other-translation.cjs")
const { TitleRating } = require("./Titles/title-rating.cjs")
const { TitleInstallment } = require("./Titles/title-installment.cjs")
const { TitleFavorite } = require("./Titles/title-favorite.cjs")
const { TitleInstallmentStream } = require("./Titles/Streams/title-installment-stream.cjs")
const { TitleInstallmentStreamLike } = require("./Titles/Streams/title-installment-stream-like.cjs")
const { TitleInstallmentStreamWatchHistory } = require("./Titles/Streams/title-installment-stream-watch-history.cjs")
const { TitleContentAdvisory } = require("./Titles/title-content-advisory.cjs")
const { StreamVideo } = require("./Titles/Streams/stream-video.cjs")
const { StreamSubtitle } = require("./Titles/Streams/stream-subtitle.cjs")
const { StreamAudio } = require("./Titles/Streams/stream-audio.cjs")
const { TempUpload } = require("./temp-upload.cjs")

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: `${uploads.pathDatabase}/${"sqlite.db"}`,
    logging: false,
})

const models = {
    Member,
    Admin,
    Session,
    TempUpload,
    Title,
    Genre,
    TitleGenre,
    TitleOtherTranslation,
    TitleRating,
    TitleInstallment,
    TitleFavorite,
    TitleContentAdvisory,
    TitleInstallmentStream,
    StreamVideo,
    StreamSubtitle,
    StreamAudio,
    TitleInstallmentStreamLike,
    TitleInstallmentStreamWatchHistory,
}

const Database = {
    sequelize,
    models,
}

async function InitializeDatabaseModels() {
    Logging.LogProcess(`initializing database models...`)
    for (const modelName in Database.models) {
        const modelClass = Database.models[modelName]
        await modelClass.Initialize(Database)
    }

    Logging.LogProcess(`connecting associations for models...`)
    for (const modelName in Database.models) {
        const modelClass = Database.models[modelName]
        await modelClass.Connect_Associations(Database)
    }
}

async function Setup() {
    try {
        await sequelize.sync({ force: isDev })

        if (isDev) {
            const { DevSetup } = require("./dev-setup.cjs")
            await DevSetup(Database)
        } else {
            await models.Member.sync()
            await models.Session.sync()
            await models.TempUpload.sync()
            await models.Title.sync()
            await models.Genre.sync()
            await models.TitleGenre.sync()
            await models.TitleOtherTranslation.sync()
            await models.TitleRating.sync()
            await models.TitleInstallment.sync()
            await models.TitleFavorite.sync()
            await models.TitleInstallmentStream.sync()
            await models.TitleInstallmentStreamLike.sync()
            await models.TitleInstallmentStreamWatchHistory.sync()
            await models.TitleContentAdvisory.sync()
            await models.StreamVideo.sync()
            await models.StreamSubtitle.sync()
            await models.StreamAudio.sync()
            await Genre.DefaultSetup()
        }
        await Admin.DefaultSetup()
    } catch (err) {
        //throw new Error(err.message);
    }
}

InitializeDatabaseModels()
    .then(() => {
        Setup()
            .then(() => {
                Logging.LogProcess("database has been setup (=")
            })
            .catch((err) => {
                Logging.LogError(`(something went wrong setting up development)`)
                throw err
            })
    })
    .catch((err) => {
        Logging.LogError(`(something went wrong initializing the database)`)
        throw err
    })

module.exports = Database
