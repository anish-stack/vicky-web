module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define(
        'Session',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            session_id: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            discount_slug: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            pincode:{
                type: DataTypes.STRING,
                allowNull: true,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            city_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            hotel_city_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            local_rental_plan_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            time: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            airport_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            airport_city_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            airport_from_to: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            tripType: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            distance: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            phoneNo: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            pickUpDate: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            dropDate: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            places: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            car_tab: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            check_in: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            check_out: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            adult: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            children: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            rooms: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            children_ages: {
                type: DataTypes.JSON,
                allowNull: true,
            },
            dham_category_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            dham_package_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            dham_pickup_city_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            dham_package_days: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            createdBy: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            updatedBy: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            timestamps: true,
            tableName: 'sessions',
        }
    );

    return Session;
};

