# SmartStock 📦

A modern, full-stack inventory and stock management system with real-time analytics, POS capabilities, and low-stock alerts. Built with Next.js, React, PostgreSQL, and Prisma.

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Prisma](https://img.shields.io/badge/Prisma-7.6-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

## 🌟 Features

- **📊 Dashboard**: Real-time sales analytics with interactive charts and low-stock alerts
- **📦 Inventory Management**: Complete product catalog with SKU tracking, pricing, and stock levels
- **🛒 Point of Sale (POS)**: Quick and intuitive sales transaction processing
- **📈 Sales Analytics**: Visual representations of sales trends using Recharts
- **⚠️ Smart Alerts**: Automatic notifications for products with low stock levels
- **🔄 Real-time Sync**: Live data synchronization across the application
- **🎨 Responsive UI**: Modern, clean interface built with Tailwind CSS
- **🐳 Docker Support**: Containerized PostgreSQL database for easy setup

## 🛠️ Tech Stack

### Frontend
- [Next.js](https://nextjs.org/) - React framework with server-side rendering
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Recharts](https://recharts.org/) - Composable charting library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

### Backend
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) - Serverless functions
- [Express.js](https://expressjs.com/) - Web application framework
- [Node.js](https://nodejs.org/) - Runtime environment

### Database & ORM
- [PostgreSQL](https://www.postgresql.org/) - Relational database
- [Prisma](https://www.prisma.io/) - Modern ORM for database access

### DevOps
- [Docker](https://www.docker.com/) - Container platform
- [Docker Compose](https://docs.docker.com/compose/) - Multi-container orchestration

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [PostgreSQL](https://www.postgresql.org/) (optional if using Docker)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SmartStock
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/smartstock"
PORT=3001

# Next.js Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"
```

### 4. Start PostgreSQL Database

#### Using Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the following credentials:
- **User**: postgres
- **Password**: password
- **Database**: smartstock
- **Port**: 5432

#### Using Local PostgreSQL

Ensure PostgreSQL is running and create a database:

```bash
createdb smartstock
```

### 5. Set Up Prisma

Initialize and run database migrations:

```bash
npx prisma migrate dev --name init
```

This command will:
- Create the database schema
- Generate Prisma client
- Seed the database (if seed script exists)

### 6. Run the Development Server

Start both the Next.js frontend and Express backend:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

The API server runs on `http://localhost:3001`

## 📁 Project Structure

```
SmartStock/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout component
│   ├── page.tsx                 # Dashboard, inventory, and POS pages
│   └── globals.css              # Global styles
├── prisma/
│   └── schema.prisma            # Database schema and models
├── server.js                     # Express.js API server
├── docker-compose.yml            # Docker Compose configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── postcss.config.js            # PostCSS configuration
├── package.json                 # Project dependencies
└── README.md                     # This file
```

## 📊 Database Schema

### Product Model
```prisma
model Product {
  id            Int      @id @default(autoincrement())
  name          String   // Product name
  sku           String   @unique  // Stock Keeping Unit
  price         Float    // Product price
  stockQuantity Int      // Current stock level
  sales         Sale[]   // Relationship to sales records
}
```

### Sale Model
```prisma
model Sale {
  id           Int      @id @default(autoincrement())
  productId    Int      // Foreign key to Product
  quantitySold Int      // Quantity sold in transaction
  date         DateTime @default(now())  // Transaction date
  product      Product  @relation(fields: [productId], references: [id])
}
```

## 🔌 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Sales
- `GET /api/sales` - Get all sales records
- `POST /api/sales` - Record a new sale
- `GET /api/sales/analytics` - Get sales analytics data

## 📝 Available Scripts

### Development

```bash
npm run dev
```

Starts the development server with hot reload.

### Build

```bash
npm run build
```

Creates an optimized production build.

### Production

```bash
npm start
```

Starts the application in production mode.

### Linting

```bash
npm run lint
```

Runs ESLint to check code quality.

### Prisma Studio

```bash
npx prisma studio
```

Opens the interactive Prisma Studio to view and edit database records.

## 🎯 Usage

### Dashboard Tab
- View sales trends with interactive charts
- Monitor products with low stock levels
- Get quick insights into inventory status

### Inventory Tab
- Browse all products in your catalog
- View product details (name, SKU, price, stock quantity)
- Manage product inventory

### POS Tab
- Select a product and quantity
- Process sales transactions quickly
- Update stock automatically on sale

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter connection errors:

1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Check your `DATABASE_URL` in `.env.local`

3. Ensure the database exists:
   ```bash
   psql -U postgres -l
   ```

### Port Already in Use

If port 3001 is in use, update the `PORT` in `.env.local`:

```env
PORT=3002
```

### Prisma Client Issues

Regenerate the Prisma client:

```bash
npx prisma generate
npx prisma db push
```

## 📦 Dependencies

See [package.json](package.json) for a complete list of dependencies. Key packages:

- `next` - React framework
- `react` & `react-dom` - UI library
- `@prisma/client` - Database ORM
- `express` - API framework
- `recharts` - Charting library
- `tailwindcss` - CSS framework

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Support

For support, questions, or feedback, please open an issue on the repository or contact the development team.

## 🗺️ Roadmap

- [ ] User authentication and authorization
- [ ] Multi-level approval workflows
- [ ] Advanced reporting and analytics
- [ ] Inventory forecasting with ML
- [ ] Mobile app support
- [ ] Multi-warehouse support
- [ ] Email and SMS notifications
- [ ] Integration with payment gateways

---

**Happy Stocking! 📦✨**
