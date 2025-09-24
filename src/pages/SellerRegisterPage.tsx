dgsdimport React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';

export function SellerRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
  data: {
    first_name: firstName,
    last_name: lastName,
    role: 'seller', // Add this line
  },
},

      });

      if (signUpError) {
        throw signUpError;
      }

      // Update user profile with first_name and last_name
      if (user) {
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              id: user.id,
              first_name: firstName,
              last_name: lastName,
              role: 'seller', // Add this line
            });

          if (profileError) {
            console.error('Error updating user profile:', profileError);
            // Note: We don't throw here because the main registration was successful
          }
        } catch (profileErr) {
          console.error('Error during profile update:', profileErr);
        }
      }

      // Redirect to account dashboard after successful registration
      navigate('/account');
    } catch (error: any) {
      setError(error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brown-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold text-brown-900 mb-6 text-center">Register as a Seller</h2>
          <p className="mt-2 text-center text-sm text-brown-600">
  Or{' '}
  <Link
    to="/login"
    className="font-medium text-brown-600 hover:text-brown-500"
  >
    Already a seller? Sign in here
  </Link>
</p>

        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label htmlFor="first-name" className="sr-only">
                First name
              </label>
              <input
                id="first-name"
                name="first-name"
                type="text"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="last-name" className="sr-only">
                Last name
              </label>
              <input
                id="last-name"
                name="last-name"
                type="text"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-brown-900 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
