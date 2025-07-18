module.exports = (mongoose) => {
    const schema = mongoose.Schema(
        {
            name: { type: String, required: true },
            email: { type: String, required: true },
            password: { type: String, required: true },
            is_deleted: { type: Boolean, default: false },
        },
        { timestamps: true }
    );

    const Users = mongoose.model("users", schema);
    return Users;
};