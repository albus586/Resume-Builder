"use client";

import { useEffect, useState, useRef } from "react";
import { ProfileForm } from "@/components/profile-form";
import { Card } from "@/components/ui/card";
import { Profile } from "@/schema/profile";
import { Skeleton } from "@/components/ui/skeleton";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { User, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (profile?.profilePhoto) {
      setPhotoPreview(profile.profilePhoto);
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.error === "Unauthorized") {
          toast.error("Session expired", {
            description: "Please login again to continue.",
          });
          router.push("/sign-in");
          return;
        }
        setProfile(data);
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle profile photo upload UI only (no API logic here)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerPhotoInput = () => {
    photoInputRef.current?.click();
  };

  const renderProfileCard = () => (
    <Card className="flex flex-col md:flex-row items-center gap-6 p-6 mb-8 border-0 shadow-xl bg-gradient-to-br from-[#f8fafc] to-[#e0f7fa] rounded-2xl">
      <div className="relative">
        <div className="h-32 w-32 rounded-full overflow-hidden bg-[#F1F5F9] border-4 border-[#00ADB5] shadow-lg flex items-center justify-center">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt="Profile photo"
              className="object-cover h-full w-full"
            />
          ) : (
            <User className="h-16 w-16 text-[#CBD5E1]" />
          )}
        </div>
        <button
          type="button"
          onClick={triggerPhotoInput}
          className="absolute bottom-2 right-2 bg-[#00ADB5] hover:bg-[#089DA6] text-white rounded-full p-2 shadow-md transition-colors"
          aria-label="Upload profile photo"
        >
          <Upload className="h-4 w-4" />
        </button>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>
      <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
        <h2 className="text-2xl md:text-3xl font-bold text-[#22223b]">
          {profile?.name || "Your Name"}
        </h2>
        <div className="flex flex-wrap gap-2 text-[#00ADB5] font-medium">
          {profile?.contact?.email && (
            <span className="bg-[#e0f2fe] px-3 py-1 rounded-full text-sm">
              {profile.contact.email}
            </span>
          )}
          {profile?.contact?.phone && (
            <span className="bg-[#e0f2fe] px-3 py-1 rounded-full text-sm">
              {profile.contact.phone}
            </span>
          )}
          {profile?.contact?.address?.city && (
            <span className="bg-[#e0f2fe] px-3 py-1 rounded-full text-sm">
              {profile.contact.address.city}
            </span>
          )}
        </div>
        <div className="text-[#64748B] text-sm mt-2">
          {profile?.careerObjective
            ? profile.careerObjective.slice(0, 80) +
              (profile.careerObjective.length > 80 ? "..." : "")
            : "Add a career objective to make your profile stand out."}
        </div>
      </div>
    </Card>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 space-y-8 p-8 pt-6">
          <Card className="flex items-center gap-6 p-6 mb-8 border-0 shadow-xl bg-gradient-to-br from-[#f8fafc] to-[#e0f7fa] rounded-2xl">
            <Skeleton className="h-32 w-32 rounded-full bg-[#393E46]/10" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48 bg-[#393E46]/10" />
              <Skeleton className="h-4 w-32 bg-[#393E46]/10" />
              <Skeleton className="h-4 w-64 bg-[#393E46]/10" />
            </div>
          </Card>
          <Card className="p-8 border-0 shadow-lg bg-white rounded-2xl">
            <div className="space-y-6">
              <Skeleton className="h-7 w-[180px] bg-[#393E46]/10" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full bg-[#393E46]/10" />
                <Skeleton className="h-12 w-full bg-[#393E46]/10" />
              </div>
              <Skeleton className="h-12 w-full bg-[#393E46]/10" />
              <Skeleton className="h-24 w-full bg-[#393E46]/10" />
              <Skeleton className="h-10 w-[120px] ml-auto bg-[#393E46]/10" />
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        {renderProfileCard()}
        <Card className="p-8 border-0 shadow-lg bg-white rounded-2xl">
          {profile?.userId ? (
            <ProfileForm
              initialData={{
                ...profile,
                profilePhoto: photoPreview || profile?.profilePhoto,
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-gray-500 mb-4">User profile not available</p>
              <Link href="/login">
                <Button>Sign in to continue</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#F8F9FA] min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 sticky top-0 z-10 bg-white border-b border-[#E5E7EB] px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-[#393E46] hover:bg-[#00ADB5]/10 hover:text-[#00ADB5]" />
            <h1 className="text-xl font-semibold text-[#393E46]">My Profile</h1>
          </div>
        </header>
        {renderContent()}
      </SidebarInset>
    </SidebarProvider>
  );
}
