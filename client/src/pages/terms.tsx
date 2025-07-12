import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Footer } from "@/components/footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-lavender-50">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-navy-900">Terms & Conditions</h1>
            <p className="text-navy-600">Last updated: July 11, 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 prose prose-navy max-w-none">
          <p className="text-lg text-navy-700 mb-6">
            Welcome to Dreamlets, a product of Q5 Labs, LLC ("we," "our," or "us"). By accessing or using Dreamlets, you agree to these Terms and Conditions ("Terms"). Please read them carefully.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">1. Overview</h2>
            <p className="text-navy-700 leading-relaxed">
              Dreamlets is an AI-powered storytelling platform designed to create short, imaginative bedtime stories. The content is intended for entertainment purposes only and should not be considered educational, therapeutic, or advisory.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">2. Use Restrictions</h2>
            <p className="text-navy-700 leading-relaxed mb-4">
              You agree to use Dreamlets responsibly. You may not use the service to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-navy-700">
              <li>Generate stories or images that are harmful, profane, obscene, or otherwise inappropriate</li>
              <li>Upload offensive or illegal material as prompts or character descriptions</li>
              <li>Harass, impersonate, or violate the rights of others</li>
              <li>Attempt to reverse engineer or misuse the platform</li>
            </ul>
            <p className="text-navy-700 leading-relaxed mt-4">
              We reserve the right to suspend or terminate accounts that violate these guidelines.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">3. AI-Generated Content</h2>
            <p className="text-navy-700 leading-relaxed mb-4">
              All stories and illustrations are generated using artificial intelligence. While we take steps to promote safe, wholesome output, we cannot guarantee that all content will be suitable for every child or household.
            </p>
            <p className="text-navy-700 leading-relaxed">
              If you see something concerning, please use the "Report" feature or contact us directly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">4. Similarity Disclaimer</h2>
            <p className="text-navy-700 leading-relaxed">
              Any resemblance to real persons, characters (fictional or otherwise), or events is entirely coincidental and unintentional. Dreamlets does not knowingly replicate copyrighted characters or personalities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">5. Intellectual Property</h2>
            <p className="text-navy-700 leading-relaxed mb-4">
              You retain full ownership of the story ideas, character names, and custom inputs you provide. We retain the rights to the generated content for the purpose of operating the service.
            </p>
            <p className="text-navy-700 leading-relaxed">
              You are free to download, print, and share your stories for personal use. You may not resell or redistribute Dreamlets-generated content without written permission from Q5 Labs, LLC.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">6. Account & Data Privacy</h2>
            <ul className="list-disc pl-6 space-y-2 text-navy-700">
              <li>You must create an account to save stories or access premium features.</li>
              <li>Your stories, characters, and images are stored privately and securely, tied to your account.</li>
              <li>You can delete any or all of your data at any time by visiting your account settings.</li>
              <li>We will never sell your data or share it outside the scope of providing the Dreamlets experience.</li>
            </ul>
            <p className="text-navy-700 leading-relaxed mt-4">
              For details, see our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">7. Subscription & Billing</h2>
            <p className="text-navy-700 leading-relaxed mb-4">
              Dreamlets offers a free tier and a paid subscription plan. All billing is handled securely through Stripe.
            </p>
            <p className="text-navy-700 leading-relaxed">
              By subscribing, you authorize us to charge your selected payment method on a recurring basis. You can manage or cancel your subscription at any time through your account or the Stripe billing portal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">8. Termination</h2>
            <p className="text-navy-700 leading-relaxed">
              You may delete your account at any time. We reserve the right to terminate or suspend your account if you violate these Terms or misuse the platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-navy-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, Q5 Labs, LLC shall not be liable for any indirect, incidental, or consequential damages arising from the use of Dreamlets.
            </p>
            <p className="text-navy-700 leading-relaxed">
              All content is provided "as is" with no warranties, express or implied.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">10. Changes to Terms</h2>
            <p className="text-navy-700 leading-relaxed">
              We may update these Terms from time to time. If we make material changes, we'll notify you by email or through the app. Continued use of Dreamlets after changes constitutes your acceptance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900 mb-4">11. Contact</h2>
            <p className="text-navy-700 leading-relaxed mb-4">
              Dreamlets is a product of:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-navy-700 font-medium">Q5 Labs, LLC</p>
              <p className="text-navy-700">John Stephens</p>
              <p className="text-navy-700">301 Soule Ave</p>
              <p className="text-navy-700">Pleasant Hill, CA 94523</p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}