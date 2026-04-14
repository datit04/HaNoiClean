using FluentValidation;

namespace KnowledgeSpace.ViewModels.Systems
{
	public class UserCreateRequestValidator : AbstractValidator<UserCreateRequest>
	{
		public UserCreateRequestValidator()
		{
			RuleFor(x => x.UserName).NotEmpty().WithMessage("User name is required");

			RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required")
				.MinimumLength(8).WithMessage("Password has to atleast 8 characters")
				.Matches(@"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$")
				.WithMessage("Password is not match complexity rules.");

			RuleFor(x => x.Email).NotEmpty().WithMessage("Email is required")
				.Matches(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$").WithMessage("Email format is not match");

			RuleFor(x => x.PhoneNumber).NotEmpty().WithMessage("Phone number is required");

			RuleFor(x => x.FullName).NotEmpty().WithMessage("Full name is required")
				.MaximumLength(100).WithMessage("Full name can not over 100 characters limit");
		}
	}
}