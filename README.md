# Elegant Leather Backend

A NestJS backend API for Elegant Leather e-commerce platform, providing secure admin management of products and leathers with Cloudinary image uploads.

## Features

- **Admin Authentication**: JWT-based authentication for admin dashboard
- **Product Management**: CRUD operations for products with image uploads
- **Leather Management**: CRUD operations for leather materials with image uploads
- **Category Management**: Organize products and leathers by categories
- **Image Upload**: Cloudinary integration for storing product/leather images
- **MongoDB**: Document-based database for flexible data storage

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **File Upload**: Multer with Cloudinary
- **Validation**: Class Validator
- **Language**: TypeScript

## Installation

```bash
$ npm install
```

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/elegant-leather
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Running the app

```bash
# development
$ npm run start:dev

# production
$ npm run start:prod
```

## Seed Admin User

Run the seed script to create an admin user:

```bash
$ node seed.js
```

Default admin credentials:
- Email: admin@elegantleather.com
- Password: admin123

## API Documentation

See [API_TESTING.md](API_TESTING.md) for comprehensive API testing guide.

## Project Structure

```
src/
├── app.module.ts
├── main.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   ├── guards/
│   └── strategies/
├── categories/
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   ├── categories.module.ts
│   └── schemas/
├── product/
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.module.ts
│   └── schemas/
├── leathers/
│   ├── leathers.controller.ts
│   ├── leathers.service.ts
│   ├── leathers.module.ts
│   └── schemas/
├── cloudinary/
│   ├── cloudinary.service.ts
│   └── cloudinary.module.ts
├── config/
└── users/
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## License

UNLICENSED

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
