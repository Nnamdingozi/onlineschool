"use client"

import ProfileCard from '@/components/reactbitstyles/profileCard';
import { getUserProfileClient } from '@/lib/getUserProfileClient';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const users = [
  {
    name: 'JS 1',
    title: 'Junior Secondary school 1',
    contactText: 'go to class',
    avatarUrl: '/images/microscope.png',
  },
  {
    name: 'JS 2',
    title: 'Junior Secondary school 2',
    contactText: 'go to class',
    avatarUrl: '/images/purpleFlower.jpg',
  },
  {
    name: 'JS 3',
    title: 'Junior Secondary school 3',
    contactText: 'Click below to go to your classroom',
    avatarUrl: '/images/studentStudy.png',
  },
  {
    name: 'SS 1',
    title: 'Senior Secondary School 1',
    contactText: 'go to class',
    avatarUrl: '/images/studentStudy.png',
  },
  {
    name: 'SS 2',
    title: 'Senior Secondary School 2',
    contactText: 'go to class',
    avatarUrl: '/images/studentStudy.png',
  },
  {
    name: 'SS 3',
    title: 'Senior Secondary School 3',
    contactText: 'go to class',
    avatarUrl: '/images/studentStudy.png',
  },

];





export default  function ProfileCardWrapper() {
const [gradeId, setGradeId] = useState<number | null>(null);


    const router = useRouter();
    useEffect(() => {
      const fetchProfile = async () => {
        const profileData = await getUserProfileClient();
        console.log("profileData from cardWrapper:", profileData)
        const data = profileData?.profile?.grade_id
        setGradeId(data ?? null);
      };
      fetchProfile();
    }, []);
    

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 mx-auto">
      {users.map((user, index) => (
        <ProfileCard
          key={index}
          {...user}
          showUserInfo={true}
          enableTilt={true}
        //   onContactClick={() => console.log(`Contact clicked: ${user.name}`)}
          onContactClick={() => {
            if(gradeId) 	{
              router.push(`/protected/notes/${gradeId}`)
            }
          }}

        />
      ))}
    </div>
  );
}
