import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Package } from 'lucide-react';

interface VendorOnboardingProps {
  hasVendor: boolean;
  hasProducts: boolean;
  onScrollToProductForm: () => void;
}

export default function VendorOnboarding({ hasVendor, hasProducts, onScrollToProductForm }: VendorOnboardingProps) {
  const steps = [
    {
      id: 'vendor',
      title: 'Create Vendor Account',
      description: 'Set up your vendor profile',
      completed: hasVendor,
    },
    {
      id: 'product',
      title: 'Add Your First Product',
      description: 'List a product to start selling',
      completed: hasProducts,
    },
  ];

  const currentStep = steps.findIndex(step => !step.completed);
  const allComplete = currentStep === -1;

  if (allComplete) {
    return null;
  }

  return (
    <Card className="mb-8 border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Complete Your Vendor Setup
        </CardTitle>
        <CardDescription>
          Follow these steps to get your vendor account ready for business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card transition-colors hover:bg-accent/50"
            >
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <Circle className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                {!step.completed && index === currentStep && step.id === 'product' && (
                  <Button onClick={onScrollToProductForm} size="sm">
                    Add Product
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
