import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Success",
        description: "Successfully logged in",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("Email changing to:", newValue); // For debugging, can remove later
    setEmail(newValue);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <div className='grid gap-6'>
      <form
        onSubmit={handleSubmit}
        style={{ position: "relative", zIndex: 10 }}
      >
        <div className='grid gap-4'>
          <div className='grid gap-1 input-wrapper'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              name='email'
              type='email'
              value={email}
              onChange={handleEmailChange}
              onClick={(e) => e.currentTarget.focus()}
              autoFocus
              autoComplete='email'
              placeholder='your.email@example.com'
              className='w-full px-4 py-2 focus:ring-2 focus:ring-primary relative z-10'
              style={{ pointerEvents: "auto" }}
              required
            />
          </div>
          <div className='grid gap-1 input-wrapper'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={handlePasswordChange}
              onClick={(e) => e.currentTarget.focus()}
              placeholder='••••••••'
              className='w-full px-4 py-2 relative z-10'
              style={{ pointerEvents: "auto" }}
              required
            />
          </div>
          <Button type='submit' disabled={isLoading} className='relative z-10'>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
      <div className='text-center'>
        <Button
          variant='link'
          onClick={() => navigate("/signup")}
          className='relative z-10'
        >
          Don't have an account? Sign up
        </Button>
      </div>
    </div>
  );
}
