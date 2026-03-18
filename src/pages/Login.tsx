import { useEffect } from 'react'

type LoginProps = {
  role: 'Shop Owner' | 'Finder'
}

const Login = ({ role }: LoginProps) => {
  useEffect(() => {
    if (role === 'Finder') {
      window.location.href = '/HertiX/';
    } else if (role === 'Shop Owner') {
      window.location.href = '/HertiX/admin/';
    }
  }, [role]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to {role} Login...</p>
    </div>
  )
}

export default Login

