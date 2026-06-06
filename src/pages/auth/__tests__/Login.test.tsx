import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "../Login";

describe("Login", () => {
  it("calls onLogin with email and password when the form is valid", async () => {
    const user = userEvent.setup();
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} serverError={null} />);

    await user.type(screen.getByPlaceholderText("Email"), "user@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "secretpass");
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledTimes(1);
    });

    const [formData] = onLogin.mock.calls[0];
    expect(formData).toEqual({
      email: "user@example.com",
      password: "secretpass",
    });
  });

  it("does not call onLogin when required fields are empty", async () => {
    const user = userEvent.setup();
    const onLogin = jest.fn();
    render(<Login onLogin={onLogin} serverError={null} />);

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(onLogin).not.toHaveBeenCalled();
  });

  it("renders server error from the parent when sign-in fails", () => {
    render(
      <Login
        onLogin={jest.fn()}
        serverError="Invalid login credentials"
      />,
    );
    expect(
      screen.getByText("Invalid login credentials"),
    ).toBeInTheDocument();
  });

  it("toggles password field between hidden and visible", async () => {
    const user = userEvent.setup();
    render(<Login onLogin={jest.fn()} serverError={null} />);

    const passwordInput = screen.getByPlaceholderText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    const [toggleButton] = screen.getAllByRole("button");
    await user.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");
  });
});
