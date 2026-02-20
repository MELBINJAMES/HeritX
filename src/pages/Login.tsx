import { useEffect } from 'react'

type LoginProps = {
  role: 'Shop Owner' | 'Finder'
}

const Login = ({ role }: LoginProps) => {
  useEffect(() => {
    if (role === 'Shop Owner') {
      window.location.href = 'http://localhost:5174/shop-owner/login';
    } else {
      window.location.href = 'http://localhost:3000/login';
    }
  }, [role]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to {role} Login...</p>
    </div>
  )
}

export default Login

