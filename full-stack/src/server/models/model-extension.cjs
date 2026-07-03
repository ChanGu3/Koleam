const { Model } = require("sequelize")

class ModelExtension extends Model {
    /**
     * @abstract
     */
    static async Initialize({ sequelize: _s, models: _m }) {
        return
    }

    /**
     * @abstract
     */
    static async Connect_Associations({ sequelize: _s, models: _m }) {
        return
    }
}

module.exports.ModelExtension = ModelExtension
