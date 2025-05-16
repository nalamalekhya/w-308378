
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WaveformAnimation } from "@/components/ui/waveform-animation";
import { Clock } from "lucide-react";

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TutorialOverlay({ isOpen, onClose }: TutorialOverlayProps) {
  const [step, setStep] = React.useState(1);
  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onClose();
      setStep(1);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Welcome to EchoVerse</DialogTitle>
              <DialogDescription>
                Send messages to your future self with audio diaries
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center">
              <div className="h-32 w-32 rounded-full bg-echo-light dark:bg-echo-dark flex items-center justify-center mb-6 animate-float">
                <WaveformAnimation />
              </div>
              <p className="text-center">
                EchoVerse lets you record audio messages meant to be heard by your future self, 
                at a date and time you choose.
              </p>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Locked & Unlocked Echoes</DialogTitle>
              <DialogDescription>
                Your messages are time-protected
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              <div className="flex gap-6">
                <div className="flex-1 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 mr-2 text-echo-past" />
                    <h4 className="font-medium">Locked Echo</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Time-locked until the date you choose. You can see it exists, but not play it back.
                  </p>
                </div>
                <div className="flex-1 p-4 border rounded-lg bg-background">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 mr-2 text-echo-accent" />
                    <h4 className="font-medium">Unlocked Echo</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Once the unlock date arrives, your Echo becomes available to play back.
                  </p>
                </div>
              </div>
              <p className="text-center text-sm">
                All your audio is encrypted and secure. Only you can access your Echoes.
              </p>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Record Your First Echo</DialogTitle>
              <DialogDescription>
                Let's create your first time capsule
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <p className="text-center">
                We recommend starting with a message to yourself one year from today.
              </p>
              <div className="bg-gradient-echo-light dark:bg-echo-dark/30 p-4 rounded-lg border border-echo-light/50 dark:border-echo-past/30">
                <h4 className="font-medium mb-2">Suggested First Echo</h4>
                <p className="text-sm text-muted-foreground">
                  "Letter to myself one year from now"
                </p>
                <p className="text-sm mt-2">
                  Tell your future self what you hope for, what you're working on, and what you want to remember from this moment.
                </p>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {renderStepContent()}
        <DialogFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </p>
          <Button onClick={handleNext}>
            {step < totalSteps ? "Next" : "Get Started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
