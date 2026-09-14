import { Navigate, Route, Routes } from 'react-router-dom'
import { SiteLayout } from './layouts/SiteLayout'
import { ToolsHomePage } from './pages/ToolsHomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { MortarCalculatorPage } from '../tools/mortar/MortarCalculatorPage'

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Navigate to="/wardogs" replace />} />
        <Route path="/wardogs" element={<ToolsHomePage />} />
        <Route path="/wardogs/mortar" element={<MortarCalculatorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
