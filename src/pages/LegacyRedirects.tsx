import { Navigate, useParams } from 'react-router-dom';

/** 旧路由兼容 */
export function LegacyInvestigateRedirect() {
  const { id = '' } = useParams();
  return <Navigate to={`/case/${id}/evidence`} replace />;
}

export function LegacyInterrogateRedirect() {
  const { id = '' } = useParams();
  return <Navigate to={`/case/${id}/interrogate`} replace />;
}

export function LegacyResultRedirect() {
  const { id = '' } = useParams();
  return <Navigate to={`/case/${id}/result`} replace />;
}

export function LegacyHomeRedirect() {
  return <Navigate to="/lobby" replace />;
}

export function LegacyHistoryRedirect() {
  return <Navigate to="/archive" replace />;
}
