import express from "express";
import prisma from "./lib/prisma.js";
import bcrypt from "bcrypt";
import z from "zod";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "TASK-HUB API is running succesfully"
    });
});

// const registerSchema = z.object({
//     name: z.string.min(4),
//     email: z.email,
//     password: z.string.min(6)

// })

app.post("/register", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    });

    res.json({
        message: "Signup Done!",
        id: user.id,
        name: user.name,
        email: user.email
    });
});



app.listen(3000, () => {
    console.log("Server Running on port 3000")
})