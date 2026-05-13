const { Logging } = require("../server-logging.cjs")
const { uploadsDev, uploads } = require("../server-uploads.cjs")

const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

async function DevSetup({ sequelize, models }) {
    try {
        // Force sync all models to create tables
        await models.Member.sync({ force: true })
        await models.Title.sync({ force: true })
        await models.Title.sync({ force: true })
        await models.Genre.sync({ force: true })
        await models.Session.sync({ force: true })
        await models.TitleGenre.sync({ force: true })
        await models.TitleOtherTranslation.sync({ force: true })
        await models.TitleRating.sync({ force: true })
        await models.TitleInstallment.sync({ force: true })
        await models.TitleFavorite.sync({ force: true })
        await models.TitleInstallmentStream.sync({ force: true })
        await models.TitleInstallmentStreamLike.sync({ force: true })
        await models.TitleInstallmentStreamWatchHistory.sync({ force: true })

        const testMember = await models.Member.AddToDB("test@gmail.com", "password")

        // GENRE SETUP
        const genres = await models.Genre.DefaultSetup()

        // CLEAN AN SETUP DEFAULT Titles
        await uploadsDev.clearEntireTitlesFolder()

        const animeClouds = await models.Title.AddToDB("clouds", lorem, "clouds.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("clouds.jpg", `${animeClouds.id}/${uploads.COVER_FILENAME}`)
        const animeCloudsGenre1 = await models.TitleGenre.AddToDB(animeClouds.id, "Action")

        const animeCloudsSeason1 = await models.TitleInstallment.AddToDB(animeClouds.id, "Season 1", true, 1)
        const animeCloudsSeason1ep1 = await models.TitleInstallmentStream.AddToDB(animeClouds.id, animeCloudsSeason1.id, "The New Cloud 1", 1, lorem, new Date(1990, 0, 1, 0, 0, 0))
        await uploadsDev.copyImageFileToTitlePath("cloudsep1.jpg", `${animeClouds.id}/${animeCloudsSeason1.id}/${animeCloudsSeason1ep1.label}/${uploads.THUMBNAIL_FILENAME}`)

        const animeCloudsSeason1ep2 = await models.TitleInstallmentStream.AddToDB(animeClouds.id, animeCloudsSeason1.id, "The New Cloud 2", 2, lorem, new Date(1990, 0, 7, 0, 0, 0))
        await uploadsDev.copyImageFileToTitlePath("cloudsep2.jpg", `${animeClouds.id}/${animeCloudsSeason1.id}/${animeCloudsSeason1ep2.label}/${uploads.THUMBNAIL_FILENAME}`)

        const animeCloudsSeason1ep3 = await models.TitleInstallmentStream.AddToDB(
            animeClouds.id,
            animeCloudsSeason1.id,
            "The New Cloud 3",
            3,
            lorem,
            new Date(1990, 0, 14, 0, 0, 0)
        )
        await uploadsDev.copyImageFileToTitlePath("cloudsep3.jpg", `${animeClouds.id}/${animeCloudsSeason1.id}/${animeCloudsSeason1ep3.label}/${uploads.THUMBNAIL_FILENAME}`)

        const animeCloudsSeason1ep4 = await models.TitleInstallmentStream.AddToDB(
            animeClouds.id,
            animeCloudsSeason1.id,
            "The New Cloud 4",
            4,
            lorem,
            new Date(1990, 0, 21, 0, 0, 0)
        )
        await uploadsDev.copyImageFileToTitlePath("cloudsep4.jpg", `${animeClouds.id}/${animeCloudsSeason1.id}/${animeCloudsSeason1ep4.label}/${uploads.THUMBNAIL_FILENAME}`)

        const animeCloudsSeason1ep5 = await models.TitleInstallmentStream.AddToDB(
            animeClouds.id,
            animeCloudsSeason1.id,
            "The New Cloud 5",
            5,
            lorem,
            new Date(1990, 0, 28, 0, 0, 0)
        )
        await uploadsDev.copyImageFileToTitlePath("cloudsep5.jpg", `${animeClouds.id}/${animeCloudsSeason1.id}/${animeCloudsSeason1ep5.label}/${uploads.THUMBNAIL_FILENAME}`)

        const animeCloudsSeason1ep6 = await models.TitleInstallmentStream.AddToDB(animeClouds.id, animeCloudsSeason1.id, "The New Cloud 6", 6, lorem, new Date(1990, 1, 7, 0, 0, 0))
        await uploadsDev.copyImageFileToTitlePath("cloudsep6.jpg", `${animeClouds.id}/${animeCloudsSeason1.id}/${animeCloudsSeason1ep6.label}/${uploads.THUMBNAIL_FILENAME}`)

        const animeCloudsSeason2 = await models.TitleInstallment.AddToDB(animeClouds.id, "Season 2", true)
        const animeCloudsSeason2ep1 = await models.TitleInstallmentStream.AddToDB(
            animeClouds.id,
            animeCloudsSeason2.id,
            "The Next Cloud 1",
            1,
            lorem,
            new Date(1990, 0, 1, 0, 0, 0)
        )
        await uploadsDev.copyImageFileToTitlePath("cloudss2ep1.jpg", `${animeClouds.id}/${animeCloudsSeason2.id}/${animeCloudsSeason2ep1.label}/${uploads.THUMBNAIL_FILENAME}`)

        const animeCloudsMovie1 = await models.TitleInstallment.AddToDB(animeClouds.id, "Movie: The Cloud Up Above", false)
        const animeCloudsMovie1part1 = await models.TitleInstallmentStream.AddToDB(
            animeClouds.id,
            animeCloudsMovie1.id,
            "The Cloud Up Above",
            1,
            lorem,
            new Date(1990, 0, 1, 0, 0, 0)
        )
        await uploadsDev.copyImageFileToTitlePath(
            "cloudsmovie1part1.jpg",
            `${animeClouds.id}/${animeCloudsMovie1.id}/${animeCloudsMovie1part1.label}/${uploads.THUMBNAIL_FILENAME}`
        )

        const anime1 = await models.Title.AddToDB("StarlitHorizon", lorem, "starlit.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("starhorizon.jpg", `${anime1.id}/${uploads.COVER_FILENAME}`)
        const anime1Genre1 = await models.TitleGenre.AddToDB(anime1.id, "Action")

        const anime1Season1 = await models.TitleInstallment.AddToDB(anime1.id, "Season 1", true, 1)
        const anime1Season1ep1 = await models.TitleInstallmentStream.AddToDB(anime1.id, anime1Season1.id, "The New Horizon 1", 1, lorem, new Date(1990, 0, 1, 0, 0, 0))
        await uploadsDev.copyImageFileToTitlePath("starlithorizonep1.jpg", `${anime1.id}/${anime1Season1.id}/${anime1Season1ep1.label}/${uploads.THUMBNAIL_FILENAME}`)

        const anime2 = await models.Title.AddToDB("MoonlitSakura", lorem, "sakura.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("moonsakura.jpg", `${anime2.id}/${uploads.COVER_FILENAME}`)
        const anime2Genre1 = await models.TitleGenre.AddToDB(anime2.id, "Action")

        const anime3 = await models.Title.AddToDB("CrimsonWave", lorem, "crimson.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("crimsonwave.jpg", `${anime3.id}/${uploads.COVER_FILENAME}`)

        const anime4 = await models.Title.AddToDB("TwilightNinja", lorem, "ninja.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("twilightninja.jpg", `${anime4.id}/${uploads.COVER_FILENAME}`)

        const anime5 = await models.Title.AddToDB("AzureDragon", lorem, "azure.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("azuredragon.jpg", `${anime5.id}/${uploads.COVER_FILENAME}`)

        const anime6 = await models.Title.AddToDB("ShadowBlossom", lorem, "blossom.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("shadowblossom.jpg", `${anime6.id}/${uploads.COVER_FILENAME}`)

        const anime7 = await models.Title.AddToDB("EclipseVoyage", lorem, "eclipse.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("eclipsevoyage.jpg", `${anime7.id}/${uploads.COVER_FILENAME}`)

        const anime8 = await models.Title.AddToDB("RadiantKoi", lorem, "koi.inc", "Japanese")
        await uploadsDev.copyImageFileToTitlePath("radiantkoi.jpg", `${anime8.id}/${uploads.COVER_FILENAME}`)

        // Favorite
        const testFavorite1 = await models.TitleFavorite.AddToDB(testMember.email, animeClouds.id)
        const testLike1 = await models.TitleInstallmentStreamLike.AddToDB(testMember.email, animeCloudsSeason1ep1.id)
        await models.TitleInstallmentStreamWatchHistory.AddToDB(testMember.email, animeCloudsSeason1ep5.id)
        await models.TitleInstallmentStreamWatchHistory.AddToDB(testMember.email, animeCloudsSeason1ep1.id)
        await models.TitleInstallmentStreamWatchHistory.AddToDB(testMember.email, animeCloudsSeason1ep2.id)
        await new Promise((resolve) => setTimeout(resolve, 100))
        await models.TitleInstallmentStreamWatchHistory.AddToDB(testMember.email, animeCloudsSeason1ep3.id)
        await models.TitleInstallmentStreamWatchHistory.AddToDB(testMember.email, animeCloudsSeason2ep1.id)
        await models.TitleInstallmentStreamWatchHistory.AddToDB(testMember.email, anime1Season1ep1.id)

        Logging.LogDev(`dev setup successfully completed`)
    } catch (err) {
        Logging.LogDev(`dbsetup: ${err.message}`)
    }
}

module.exports.DevSetup = DevSetup
