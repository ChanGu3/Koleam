const { Model } = require("sequelize")

class ModelExtension extends Model {
    /**
     * @abstract
     */
    static async Initialize({ sequelize, models }) {
        return
    }

    /**
     * @abstract
     */
    static async Connect_Associations({ sequelize, models }) {
        return
    }
}

module.exports.ModelExtension = ModelExtension
