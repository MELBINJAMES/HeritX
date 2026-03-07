import { useEffect } from 'react'

type RegisterProps = {
  defaultRole?: 'Shop Owner' | 'Finder'
  lockRole?: boolean
}

const Register = ({ defaultRole = 'Shop Owner' }: RegisterProps) => {
  useEffect(() => {
    if (defaultRole === 'Shop Owner') {
      window.location.href = 'http://localhost:3002/register/owner';
    } else {
      window.location.href = 'http://localhost:3001/register/finder';
    }
  }, [defaultRole]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Redirecting to {defaultRole} Registration...</p>
    </div>
  )
}

export default Register

