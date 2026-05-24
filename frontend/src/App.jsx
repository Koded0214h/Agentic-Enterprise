import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
import AppShell from './pages/app/AppShell'
import Overview from './pages/app/Overview'
import BlueprintGallery from './pages/app/BlueprintGallery'
import BlueprintDetail from './pages/app/BlueprintDetail'
import DeployWizard from './pages/app/DeployWizard'
import WorkflowRun from './pages/app/WorkflowRun'
import SwarmRun from './pages/app/SwarmRun'
import ApprovalsInbox from './pages/app/ApprovalsInbox'
import ApprovalDetail from './pages/app/ApprovalDetail'
import AgentsPage from './pages/app/AgentsPage'
import Observe from './pages/app/Observe'
import Finance from './pages/app/Finance'
import IAMPage from './pages/app/IAMPage'
import Settings from './pages/app/Settings'
import MemoryViewer from './pages/app/MemoryViewer'
import WorkflowTemplates from './pages/app/WorkflowTemplates'
import AgentDetail from './pages/app/AgentDetail'
import Projects from './pages/app/Projects'
import Ops from './pages/app/Ops'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/onboarding"
            element={<ProtectedRoute><Onboarding /></ProtectedRoute>}
          />
          <Route
            path="/app"
            element={<ProtectedRoute><AppShell /></ProtectedRoute>}
          >
            <Route index element={<Overview />} />
            <Route path="projects" element={<Projects />} />
            <Route path="blueprints" element={<BlueprintGallery />} />
            <Route path="blueprints/:id" element={<BlueprintDetail />} />
            <Route path="blueprints/:id/deploy" element={<DeployWizard />} />
            <Route path="workflows/:id/run" element={<WorkflowRun />} />
            <Route path="swarm/:runId" element={<SwarmRun />} />
            <Route path="approvals" element={<ApprovalsInbox />} />
            <Route path="approvals/:id" element={<ApprovalDetail />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="agents/:id" element={<AgentDetail />} />
            <Route path="observe" element={<Observe />} />
            <Route path="finance" element={<Finance />} />
            <Route path="ops" element={<Ops />} />
            <Route path="iam" element={<IAMPage />} />
            <Route path="iam/*" element={<IAMPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="memory" element={<MemoryViewer />} />
            <Route path="templates" element={<WorkflowTemplates />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
