import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { auth } from '@/lib/firebase'; // Import auth instance
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    AuthError 
} from 'firebase/auth';

// Schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const handleLoginSubmit = async (data: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      console.log('Logged in successfully!');
      onClose(); // Close dialog on success
      loginForm.reset();
      signupForm.reset();
    } catch (err) {
      const authError = err as AuthError;
      console.error('Login error:', authError);
      setError(authError.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (data: SignupFormValues) => {
    setError(null);
     setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      console.log('Signed up successfully!');
      onClose(); // Close dialog on success
      loginForm.reset();
      signupForm.reset();
    } catch (err) {
       const authError = err as AuthError;
      console.error('Signup error:', authError);
      setError(authError.message || 'Failed to sign up. Please try again.');
    } finally {
       setLoading(false);
    }
  };

  // Reset forms and error when dialog closes or tab changes
  React.useEffect(() => {
    if (!isOpen) {
      setError(null);
      setLoading(false);
      loginForm.reset();
      signupForm.reset();
      setActiveTab('login'); // Reset to login tab on close
    }
  }, [isOpen, loginForm, signupForm]);
  
   React.useEffect(() => {
      setError(null); // Clear error on tab change
   }, [activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            {activeTab === 'login' ? 'Login to your account to enable editing.' : 'Create an account to get started.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */} 
          <TabsContent value="login">
             <Form {...loginForm}>
               <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4 py-4">
                 <FormField
                   control={loginForm.control}
                   name="email"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Email</FormLabel>
                       <FormControl>
                         <Input type="email" placeholder="you@example.com" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={loginForm.control}
                   name="password"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Password</FormLabel>
                       <FormControl>
                         <Input type="password" placeholder="••••••••" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                 <DialogFooter>
                   <Button type="submit" disabled={loading} className="w-full">
                     {loading ? 'Logging in...' : 'Login'}
                   </Button>
                 </DialogFooter>
               </form>
             </Form>
          </TabsContent>

          {/* Sign Up Tab */} 
          <TabsContent value="signup">
             <Form {...signupForm}>
               <form onSubmit={signupForm.handleSubmit(handleSignupSubmit)} className="space-y-4 py-4">
                 <FormField
                   control={signupForm.control}
                   name="email"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Email</FormLabel>
                       <FormControl>
                         <Input type="email" placeholder="you@example.com" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={signupForm.control}
                   name="password"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Password</FormLabel>
                       <FormControl>
                         <Input type="password" placeholder="Choose a password (min. 6 chars)" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={signupForm.control}
                   name="confirmPassword"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Confirm Password</FormLabel>
                       <FormControl>
                         <Input type="password" placeholder="Retype your password" {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                  {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                 <DialogFooter>
                   <Button type="submit" disabled={loading} className="w-full">
                     {loading ? 'Signing up...' : 'Sign Up'}
                   </Button>
                 </DialogFooter>
               </form>
             </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog; 