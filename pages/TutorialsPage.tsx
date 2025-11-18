import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Book, ChevronsUpDown } from 'lucide-react';
import { FormattedReasoning } from '@/components/FormattedReasoning';
import { tutorialsData } from '@/data/tutorialData';

type Topic = keyof typeof tutorialsData;

const AccordionItem = ({ title, content, isOpen, onClick }: { title: string; content: string; isOpen: boolean; onClick: () => void; }) => {
    return (
        <div className="border-b border-gray-700">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center text-left py-4 px-2"
            >
                <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
                <ChevronsUpDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 px-2 text-gray-300">
                    <FormattedReasoning text={content} />
                </div>
            )}
        </div>
    );
};

export default function TutorialsPage() {
    const [activeTopic, setActiveTopic] = useState<Topic>("How-To Guides");
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const handleToggleAccordion = (title: string) => {
        setOpenAccordion(prev => prev === title ? null : title);
    };
    
    const topics = Object.keys(tutorialsData) as Topic[];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                 <Book className="w-10 h-10 text-cyan-400" />
                 <div>
                    <h1 className="text-3xl font-bold text-white">Tutorials & Guides</h1>
                    <p className="text-gray-400 mt-1">Learn the core concepts of trading and cryptocurrency.</p>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Topic Navigation (Sidebar on desktop, dropdown on mobile) */}
                <aside className="md:col-span-1">
                    <h2 className="text-sm font-bold uppercase text-gray-500 mb-3 px-2">Topics</h2>
                    <nav className="space-y-2">
                        {topics.map(topic => (
                            <button
                                key={topic}
                                onClick={() => setActiveTopic(topic)}
                                className={`w-full text-left font-medium px-4 py-3 rounded-lg transition-colors duration-200 ${
                                    activeTopic === topic
                                    ? 'bg-cyan-500/20 text-cyan-300'
                                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                                }`}
                            >
                                {topic}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className="md:col-span-3">
                    <Card>
                        <CardContent className="p-4 md:p-6">
                            {tutorialsData[activeTopic].map(item => (
                                <AccordionItem
                                    key={item.title}
                                    title={item.title}
                                    content={item.content}
                                    isOpen={openAccordion === item.title}
                                    onClick={() => handleToggleAccordion(item.title)}
                                />
                            ))}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
