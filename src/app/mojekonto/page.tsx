'use client';

import { useState } from 'react';
import {useSession} from "next-auth/react";

export default function MojeKonto() {
    const { data: session } = useSession();

    const [activeMenu, setActiveMenu] = useState<'ogloszenia' | 'profil'>('ogloszenia');
    const [activeTab, setActiveTab] = useState<'aktywne' | 'zakonczone' | 'obserwowane'>('aktywne');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'aktywne':
                return <p className="text-white ml-20">Tu będą aktywne ogłoszenia</p>;
            case 'zakonczone':
                return <p className="text-white ml-20">Tu będą zakończone ogłoszenia</p>;
            case 'obserwowane':
                return <p className="text-white ml-20">Tu będą obserwowane ogłoszenia</p>;
            default:
                return null;
        }
    };

    const renderProfileContent = () => {
        return (
            <div className="text-white ml-20">
                <h2 className="text-xl font-semibold mb-4">Informacje o profilu</h2>
                <p>Imię: { session?.user?.name }</p>
                <p>Email: { session?.user?.email }</p>
            </div>
        );
    };

    return (
        <div className="flex flex-col">
            <div className="bg-[#3A3335] flex justify-start my-10 p-4 gap-20 shadow-xl text-white">
                <p
                    className={`ml-20 cursor-pointer ${activeMenu === 'ogloszenia' ? 'font-semibold' : 'font-medium'}`}
                    onClick={() => setActiveMenu('ogloszenia')}
                >
                    Ogłoszenia
                </p>
                <p
                    className={`cursor-pointer ${activeMenu === 'profil' ? 'font-semibold' : 'font-medium'}`}
                    onClick={() => setActiveMenu('profil')}
                >
                    Profil
                </p>
            </div>

            {activeMenu === 'ogloszenia' && (
                <div className="bg-[#3A3335] flex flex-col my-10 p-4 shadow-xl text-white">
                    <div className="flex justify-start gap-20 w-full mb-5 ml-20">
                        <button
                            onClick={() => setActiveTab('aktywne')}
                            className={`cursor-pointer ${activeTab === 'aktywne' ? 'font-semibold' : 'font-medium'}`}
                        >
                            Aktywne
                        </button>
                        <button
                            onClick={() => setActiveTab('zakonczone')}
                            className={`cursor-pointer ${activeTab === 'zakonczone' ? 'font-semibold' : 'font-medium'}`}
                        >
                            Zakończone
                        </button>
                        <button
                            onClick={() => setActiveTab('obserwowane')}
                            className={`cursor-pointer ${activeTab === 'obserwowane' ? 'font-semibold' : 'font-medium'}`}
                        >
                            Obserwowane
                        </button>
                    </div>

                    <div className="ml-20">{renderTabContent()}</div>
                </div>
            )}

            {activeMenu === 'profil' && (
                <div className="bg-[#3A3335] my-10 p-4 shadow-xl">
                    {renderProfileContent()}
                </div>
            )}
        </div>
    );
}
