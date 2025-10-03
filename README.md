# HouseHub - Real Estate Marketplace

HouseHub is a comprehensive real estate marketplace platform that connects property owners, students, and real estate agents in a seamless ecosystem. Built with modern technologies including React, Supabase, and Tailwind CSS, HouseHub streamlines the property search and listing process.

## 🏠 Features

### Property Management
- **Property Listings**: Owners and agents can create detailed property listings with multiple images, pricing, and specifications
- **Property Search**: Advanced search functionality with filters for location, price, bedrooms, and property type
- **Property Verification System**: Secure verification process for property authenticity

### User Roles
- **Students/Prospective Tenants**: Browse properties, submit inquiries, schedule viewings
- **Property Owners/Landlords**: List properties, manage inquiries, track tenant applications
- **Real Estate Agents**: Discover properties, request representation, manage listings, track performance

### Agent Functionality
HouseHub provides comprehensive agent management with three primary ways agents can "see" or gain properties to list:

#### 1. Discover Unassigned, Owner-Open Properties
- Properties that owners have set as "open to agents" with no agent_id
- Filterable discovery with distance, price, bedrooms, and date posted
- Agent can request to represent properties with commission offers and messages

#### 2. Receive Invitations from Landlords/Admins
- Property owners can explicitly invite agents to represent their properties
- Agents receive notifications and can accept or decline invitations
- Secure invitation workflow with verification

#### 3. Create Proposed Leads
- Agents can scout buildings/land and create draft leads (property-in-proposal)
- Owners can verify/claim or agents can convert to listings after owner consent
- Comprehensive lead management pipeline

### Technical Features
- **Real-time Notifications**: Supabase Realtime for instant updates
- **Secure Authentication**: Supabase Auth with role-based access control
- **File Storage**: Property images stored securely in Supabase Storage
- **Advanced Analytics**: Performance metrics for agents and property owners
- **Responsive Design**: Mobile-first design using Tailwind CSS

## 🚀 Technologies Used

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage, RLS)
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom design system
- **Data Visualization**: Recharts for analytics
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns

## 📋 Database Schema

### Core Tables
- **user_profiles**: User information with role management (student, landlord, agent)
- **properties**: Property listings with agent assignment and status tracking
- **property_inquiries**: Student inquiries for properties
- **property_showings**: Scheduled property viewings
- **property_verifications**: Property verification requests and status

### Agent-Specific Tables
- **agent_requests**: Track agent requests to represent properties (audit trail)
- **agent_leads**: Agent-sourced properties before owner confirms
- **agent_performance**: Track performance metrics for agents

### Additional Tables
- **verifications**: KYC documents and verification process
- **landlord_settings**: Owner payout preferences and settings
- **payouts**: Payment tracking for landlords
- **property_units**: Multi-unit property management
- **activity_log**: Audit trail for user actions

## 🔐 Security & Authentication

HouseHub implements robust security measures:

### Authentication
- JWT-based authentication via Supabase
- Multi-role support (student, landlord, agent, admin)
- Secure password management

### Row Level Security (RLS)
- **Properties**: 
  - Students can view active, approved properties
  - Property owners can manage their own properties
  - Agents can manage assigned properties
  - Agents can discover open-to-agents properties
- **Agent Requests**:
  - Agents can create requests to represent properties
  - Property owners can view requests for their properties
  - Agents can view their own requests
- **Agent Leads**:
  - Agents can manage their own leads
  - Admins have full access

### Data Protection
- Encrypted file storage for property images
- Sanitized user inputs
- Secure API endpoints with proper validation

## 🏗️ Installation

### Prerequisites
- Node.js (v16.x or higher)
- npm or yarn
- Supabase account (for backend services)

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd HouseHub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Run database migrations (if using Supabase CLI):
   ```bash
   supabase db push
   ```

## 📁 Project Structure

```
HouseHub/
├── public/                 # Static assets and manifest
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AppIcon/        # Icon components
│   │   ├── AppLayout/      # Layout components
│   │   └── ...
│   ├── contexts/           # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries (Supabase client)
│   ├── pages/              # Page components
│   │   └── dashboard/
│   │       └── components/
│   │           └── agent/  # Agent-specific components
│   ├── services/           # API services and business logic
│   ├── styles/             # Global styles and Tailwind config
│   ├── utils/              # Utility functions
│   └── App.jsx             # Main application component
├── supabase/               # Supabase configuration and migrations
│   ├── migrations/         # Database schema migrations
│   └── config.toml         # Supabase configuration
├── package.json
└── README.md
```

## 🏢 Agent Dashboard Components

### Property Discovery
- **Discover Tab**: Browse properties open to agents with filtering options
- **Invitations Tab**: View and respond to property invitations
- **Requests Sent Tab**: Track agent requests to represent properties
- **My Leads Tab**: Manage agent-sourced leads
- **My Listings Tab**: Manage assigned properties

### Performance Analytics
- **Performance Metrics**: Key performance indicators (KPIs) dashboard
- **Analytics Section**: Monthly performance charts and trends
- **Lead Management**: Kanban-style lead pipeline management

### Additional Features
- **Calendar Viewings**: Schedule and manage property showings
- **Client List**: Manage client relationships and interactions
- **Commission Ledger**: Track and manage commission payments
- **Upcoming Showings**: Day-by-day showing schedule

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Supabase for backend services
- Styled with Tailwind CSS
- Powered by React and Vite
- Icons from Lucide React

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ for the real estate community