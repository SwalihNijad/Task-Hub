import express from "express";
import prisma from "./lib/prisma.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Prisma } from "./generated/prisma/client.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "TASK-HUB API is running succesfully"
    });
});

const registerSchema = z.object({
    name: z.string().min(4),
    email: z.email(),
    password: z.string().min(6)
})

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
})

app.post("/register", async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                message: "Invalid Input",
                errors: result.error
            })
        }

        const { name, email, password } = result.data;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        });


        res.status(201).json({
            message: "Signup Done!",
            id: user.id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return res.status(409).json({
                    message: "Email already registered"
                });
            }
        }

        console.error(error);

        res.status(500).json({
            message: "Something went wrong"
        })
    }
});

app.post("/login", async (req, res) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Invalid Input",
            errors: result.error
        });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        return res.status(401).json({
            message: "Invalid email or password"
        });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
    return res.status(401).json({
        message: "Invalid email or password"
    });
}
})

app.listen(3000, () => {
    console.log("Server Running on port 3000")
})