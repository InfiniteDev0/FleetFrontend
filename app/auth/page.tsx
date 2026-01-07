import { LoginForm } from "@/components/login-form";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 !p-6 relative">
        <div
          className="absolute inset-0 opacity-30 bg-center bg-no-repeat bg-cover pointer-events-none"
          style={{
            backgroundImage:
              "url(https://hlp.test.nprod.dat.com/login/assets/map.png)",
          }}
        />
        <div className="flex justify-center gap-2 md:justify-start relative z-10">
          <Link href="" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md gap-0">
              <img
                src="https://kuwhirtafuvipkb0.public.blob.vercel-storage.com/Green_Gradient_Minimalist_Simple_Instagram_Profile_Picture-removebg-preview.png"
                alt=""
              />
            </div>
            Gam Oil Limited trading.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center relative z-10">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="https://kuwhirtafuvipkb0.public.blob.vercel-storage.com/WhatsApp%20Image%202025-12-25%20at%2021.30.25%20%281%29.jpeg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover "
        />
      </div>
    </div>
  );
}
