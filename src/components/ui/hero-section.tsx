"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Mockup, MockupFrame } from "@/components/ui/mockup";
import { Glow } from "@/components/ui/glow";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { GradientText } from "@/components/ui/gradient-text";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

interface HeroProps {
  badge?: {
    text: string;
    action: {
      text: string;
      href: string;
    };
  };
  title: string;
  description: string;
  actions: HeroAction[];
  image: {
    src: string;
    alt: string;
  };
}

export function HeroSection({
  badge,
  title,
  description,
  actions,
  image,
}: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "bg-background text-foreground",
        "py-12 sm:py-24 md:py-32 px-4",
        "fade-bottom overflow-hidden pb-0"
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 pt-16 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {/* Badge */}
          {badge && (
            <Badge 
              variant="outline" 
              className={cn(
                "gap-2 transition-all duration-500",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
            >
              <span className="text-muted-foreground">{badge.text}</span>
              <Link to={badge.action.href} className="flex items-center gap-1">
                {badge.action.text}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Badge>
          )}

          {/* Title */}
          <h1 
            className={cn(
              "relative z-10 inline-block text-4xl font-semibold leading-tight drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight",
              "transition-all duration-700 delay-100",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <GradientText className="font-bold">{title}</GradientText>
          </h1>

          {/* Description */}
          <p 
            className={cn(
              "text-md relative z-10 max-w-[550px] font-medium text-muted-foreground sm:text-xl",
              "transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {description}
          </p>

          {/* Actions */}
          <div 
            className={cn(
              "relative z-10 flex justify-center gap-4",
              "transition-all duration-700 delay-500",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {actions.map((action, index) => (
              <Button key={index} variant={action.variant || "default"} size="lg" asChild>
                <Link to={action.href} className="flex items-center gap-2">
                  {action.icon}
                  {action.text}
                </Link>
              </Button>
            ))}
          </div>

          {/* Image with Glow */}
          <div 
            className={cn(
              "relative pt-12",
              "transition-all duration-1000 delay-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            )}
          >
            <MockupFrame
              size="small"
            >
              <Mockup type="responsive">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-auto"
                />
              </Mockup>
            </MockupFrame>
            <Glow
              variant="top"
              className={cn(
                "transition-all duration-1000 delay-1000",
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              )}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
