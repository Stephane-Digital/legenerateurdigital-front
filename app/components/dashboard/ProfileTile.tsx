"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileTileProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onLogout: () => void;
}

export const ProfileTile: React.FC<ProfileTileProps> = ({ name, email, avatarUrl, onLogout }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="flex w-full max-w-sm flex-col items-center justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <CardHeader className="flex flex-col items-center space-y-3">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-gray-100 text-lg font-semibold text-gray-700">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Button
          onClick={onLogout}
          variant="outline"
          className="flex w-full items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </CardContent>
    </Card>
  );
};
