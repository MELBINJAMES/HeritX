import { useEffect } from 'react'

type LoginProps = {
  role: 'Shop Owner' | 'Finder'
}

const Login = ({ role }: LoginProps) => {
  useEffect(() => {
    if (role === 'Shop Owner') {
      window.location.href = 'http://localhost:3002/admin/dashboard';
    } else {
      window.location.href = 'http://localhost:3001/login';
    }
  }, [role]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to {role} Login...</p>
    </div>
  )
}

export default Login

