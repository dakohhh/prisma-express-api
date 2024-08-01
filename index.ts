import { PrismaClient } from "@prisma/client";
import express from "express";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import response from "./response";

const prisma = new PrismaClient();

const app = express();

app.use(bodyParser.json());


app.post("/user", async (req: Request, res: Response) => {

    const { name, email } = req.body;

    if (!name || !email) {
        res.status(400).json({ message: "Name and email are required" });

    }

	// Check if the email already exists
	const existingUser = await prisma.user.findUnique({
		where: { email: email }
	});

	if (existingUser) {
		return res.status(400).json({ message: "Email already exists" });
	}

    const user = await prisma.user.create({
        data: {
            name: name,
            email: email
        }
    });

    res.status(201).json({message: "user created successfully", data: {user: user}});
  });

app.get("/user/:userId", async (req: Request, res: Response) => {

    const userId = req.params.userId;

	const user = await prisma.user.findUnique({
		where: {
			id: userId
		}
	})

	if (!user) return res.status(404).json(response("user does not exists", null, false));

	const context = {user: user};

    res.status(200).json(response("get user successfully", context));
  });


app.get("/users", async (req: Request, res: Response) => {

	const users = await prisma.user.findMany({
		select: {
			id:true,
			name:true,
			email:true
		}
	});

	const context = {users: users};


    res.status(200).json(response("get all users successfully", context));

});


app.post("/post", async (req:Request, res:Response) =>{

	const {title, content, userId} = req.body;

	if (!title || !content || !userId){
		
		return res.status(400).json(response("title, content and userId are all required, please confirm", null, false))
	}

	const user = await prisma.user.findUnique({
		where: {
			id: userId
		}
	});


	if (!user) return res.status(400).json(response("user does not exists", null, false));

	const new_post = await prisma.post.create({
		data: {
			title: title,
			content: content,
			user: {
				connect :{
					id: userId,
				}
			}
		}
	});

	const context = {post: new_post};

    res.status(201).json(response("created post successfully", context));


});



app.get("/post/:postId", async (req:Request, res:Response) => {

	const postId = req.params.postId;

	const post = await prisma.post.findUnique({
		where: {
			id: postId
		},
	});

	if (!post) return res.status(404).json(response("post not found", null, false));

	const context = {post: post};

    res.status(200).json(response("get post successfully", context));

});


app.put("/post/:postId", async (req:Request, res:Response) => {

	const postId = req.params.postId;

	const {title, content, userId} = req.body;

	if (!title || !content || !userId){
		
		return res.status(400).json(response("title, content and userId are all required, please confirm", null, false))
	}

	const user = await prisma.user.findUnique({
		where: {
			id: userId

		},
		select: {
			id: true
		}
	});

	if (!user) return res.status(400).json(response("user does not exists", null, false));


	const post = await prisma.post.update({
		where: {
			id: postId,
			userId: user.id
		},

		data: {
			title: title,
			content: content
		}
	});


	if (!post) return res.status(404).json(response("post not found", null, false));


	const context = {post: post};

    res.status(200).json(response("updated post successfully", context));

});

app.delete("/post/:postId", async (req:Request, res:Response) => {

	const postId = req.params.postId;

	const post = await prisma.post.findUnique({
		where: {
			id: postId
		},
	});

	if (!post) return res.status(404).json(response("post not found", null, false));


	await prisma.post.delete({
		where: {
			id: post.id,
		}
	});

	const context = {post: post};

    res.status(200).json(response("deleted post successfully", context));

});



app.listen(3000, () => {
    
  console.log("Server is running on port 3000");
});