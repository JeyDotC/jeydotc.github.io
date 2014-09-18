---
layout: post
title:  "ASP STRONGLY TYPED CONTROLS, AN MVP ADDENDUM"
date:   2012-10-30
categories: Blog, ASP, MVP
---

If you are an ASP developer and hate messy code, it is very likely that you've heard about the [Model-View-Presenter pattern](http://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93presenter). As soon as one starts to play around with it, our mess-prone code starts to become more organized and our code-behind gets thinner, but we still have to deal with hundreds of user controls and code that does many repetitive tasks. This post is about a simple practice that may alleviate the remaining repetitive stuff left when applying the MVP pattern.

### A simple MVP example

Let's start from a simple MVP example. As you may already know, the pattern consist of a **Model** that represents your business logic or persistence layer (the idea uses to vary), a **View** which isn't the traditional presentation object or template but rather a representation of the data that comes and goes from/to the user, and a **Presenter** who coordinates all the stuff. 

From this point, one can think of a simple example that may look like this:

#### The Model

In our example, the model will consist of two simple classes, an entity named 'Item' and a repository that will represent our persistence layer.

```c#
public class Item {
    public string FullName { get; set; }
    public float Weight { get; set; }
}
```
Class Item which just has two fields.

```c#
public class ItemSessionRepository {
    private HttpSessionState _session;

    public ItemSessionRepository() { _session = HttpContext.Current.Session; }

    public void Add(Item item) { List().Add(item); }

    public List<Item> List() {
        if (_session["__ITEMS"] == null)
            _session["__ITEMS"] = new List<Item>();

        return _session["__ITEMS"] as List<Item>;
    }
}
```
Class `ItemSessionRepository` which persists our items to the session.

    Most samples would have an interface for the repository, but this article is mostly about presentation, so I'll leave it just this simple.
    
#### The Views

For this example we will have two views, one is for listing items, and the other is for insertion.

```c#
public interface IListView {
    void OnItemsListed(List<Item> items);
}
```

List view: it just notifies the implementer that the items has been loaded by the presenter.

```c#
public interface IInsertView {
    string FullName { get; }
    float Weight { get; }
    void OnItemInserted(Item insertedItem);
}
```

Insert view: Asks the implementer for the necessary data to insert a new item and notifies when the presenter has finally inserted the new item.

#### The Presenter

And finally the almighty presenter, this one is in charge of coordinating the interaction between the presentation and the persistence layers. 

In this case it does both, load and save Items, others would recomend to use a presenter per view, I'll use just one for brevity.

```c#
public class ItemsPresenter {
    private ItemSessionRepository _repository;

    private IListView _list;
    private IInsertView _insert;

    public IListView ListView {
        get { return _list; }
        set { _list = value; }
    }
    public IInsertView InsertView {
        get { return _insert; }
        set { _insert = value; }
    }

    public ItemsPresenter() {
        _repository = new ItemSessionRepository();
    }

    public void Insert() {
        var item = new Item {
            FullName = _insert.FullName,
            Weight = _insert.Weight
        };
        _repository.Add(item);
        _insert.OnItemInserted(item);
    }

    public void List() {
        _list.OnItemsListed(_repository.List());
    }
}
```

Items Presenter: It has a List and an insert method, the first one just takes the items from the repository and push them into the view. The second one, asks the view for the Fullname and Weight, inserts the new Item into the repository and then notifies the view that the new Item has been inserted.

#### The actual presentation Layer

And now, here is where the action occurs, first we define how our form will look like:

```xml
...

<form id="form1" runat="server">
    <div>
        <div>
            <asp:Label runat="server" AssociatedControlID="FullNameTextbox">Full name</asp:Label>
            <asp:TextBox ID="FullNameTextbox" runat="server" />
        </div>
        <div>
                <asp:Label  runat="server" AssociatedControlID="WeightTextbox">Weight</asp:Label>
                <asp:TextBox ID="WeightTextbox" runat="server" />
                <asp:CompareValidator runat="server" ControlToValidate="WeightTextbox" Type="Double" Text="This value must be a number"  ForeColor="Red" Operator="DataTypeCheck" />
            </div>
        <asp:Button ID="SaveItemButton" runat="server" Text="Save" OnClick="SaveItemButton_Click" />
    </div>
    <div>
        <asp:GridView ID="ItemsGridView" runat="server" Width="100%"></asp:GridView>
    </div>
</form>

...
```

And then make it do something from its code behind:

```csharp
public partial class Index : Page, IListView, IInsertView {
    private ItemsPresenter _presenter;
    
    #region ASP Events

    protected void Page_Load(object sender, EventArgs e) {
        _presenter = new ItemsPresenter { ListView = this, InsertView = this };
        
        if (!IsPostBack)
            _presenter.List();
    }

    protected void SaveItemButton_Click(object sender, EventArgs e) {
        _presenter.Insert();
    }

    #endregion

    #region IListView

    public void OnItemsListed(List<Item> items) {
        ItemsGridView.DataSource = items;
        ItemsGridView.DataBind();
    }

    #endregion

    #region IInsertView

    public string FullName {
        get { return FullNameTextbox.Text; }
    }
    
    public float Weight
    {
        get { return float.Parse(WeightTextbox.Text); }
    }

    public void OnItemInserted(Item insertedItem) {
        FullNameTextbox.Text = "";
        _presenter.List();
    }

    #endregion
}
```

This code behind is very simple, it just initialises the presenter and lists the items on the Page_Load method. It implements both `IListView` and `IInsertView` interfaces so it lists and inserts new Items.

So far, so good, with this example we have covered the simplest form of MVP I can come out. But simple things doesn't use to be the bread and butter of our profession (and that's the cool thing about it), so, let's complicate this example a little bit.

### A not so simple MVP example

Let's suppose that our tiny user control must take each piece of the fullname in separated controls, the model and views would still the same, that will be a prasentation-level change, not a big deal. All the other layers will remain exactly the same for the rest of the post.

    The cool way would be to consider the fullname as a value object and create a new struct, but I'll leave it as is for this example.

The new UI would look like this:

```xml
...

<form id="form1" runat="server">
 <div>
            <div>
                <asp:Label runat="server" AssociatedControlID="TreatmentDropDown">Treatment</asp:Label>
                <asp:DropDownList ID="TreatmentDropDown" runat="server">
                    <asp:ListItem Text="" Value="" />
                    <asp:ListItem Text="Dr" Value="Dr" />
                    <asp:ListItem Text="Mr" Value="Mr" />
                    <asp:ListItem Text="Mrs" Value="Mrs" />
                    <asp:ListItem Text="Lord" Value="Lord" />
                    <asp:ListItem Text="Lady" Value="Lady" />
                </asp:DropDownList>
            </div>
            <div>
                <asp:Label runat="server" AssociatedControlID="FirstNameTextbox">First name</asp:Label>
                <asp:TextBox ID="FirstNameTextbox" runat="server" />
            </div>
            <div>
                <asp:Label runat="server" AssociatedControlID="MiddleNameTextbox">Midle name</asp:Label>
                <asp:TextBox ID="MiddleNameTextbox" runat="server" />
            </div>
            <div>
                <asp:Label runat="server" AssociatedControlID="LastNameTextbox">Last name</asp:Label>
                <asp:TextBox ID="LastNameTextbox" runat="server" />
            </div>
            <div>
                <asp:Label runat="server" AssociatedControlID="SecondLastNameTextbox">Second last name</asp:Label>
                <asp:TextBox ID="SecondLastNameTextbox" runat="server" />
            </div>

            <div>
                <asp:Label runat="server" AssociatedControlID="WeightTextbox">Weight</asp:Label>
                <asp:TextBox ID="WeightTextbox" runat="server" />
                <asp:CompareValidator runat="server" ControlToValidate="WeightTextbox" Type="Double" Text="This value must be a number"  ForeColor="Red" Operator="DataTypeCheck" />
            </div>
            <asp:Button ID="SaveItemButton" runat="server" Text="Save" OnClick="SaveItemButton_Click" />
        </div>
        <div>
            <asp:GridView ID="ItemsGridView" runat="server" Width="100%"></asp:GridView>
        </div>
</form>

...
```

The form now has a `TreatmentDropDown`, `FirstNameTextbox`, `MiddleNameTextbox`, `LastNameTextbox` and `SecondLastNameTextbox`, all those represent treatment, first name, middle name, last name and a second last name, those together represent the fullname (yup, where I come from we have all those).

And now our code behind looks like this:

```csharp
public partial class Index : Page, IListView, IInsertView {
    private ItemsPresenter _presenter;

    #region ASP Events

    protected void Page_Load(object sender, EventArgs e) {
        _presenter = new ItemsPresenter { ListView = this, InsertView = this };

        if (!IsPostBack)
            _presenter.List();
    }

    protected void SaveItemButton_Click(object sender, EventArgs e) {
        if (IsValid)
            _presenter.Insert();
    }

    #endregion

    #region IListView

    public void OnItemsListed(List<Item> items) {
        ItemsGridView.DataSource = items;
        ItemsGridView.DataBind();
    }

    #endregion

    #region IInsertView

    public string FullName {
        get {
            return string.Join(" ", new List<string> {
                    TreatmentDropDown.SelectedValue,
                    FirstNameTextbox.Text,
                    MiddleNameTextbox.Text,
                    LastNameTextbox.Text,
                    SecondLastNameTextbox.Text
                }.Where(s => !string.IsNullOrWhiteSpace(s)));
        }
    }

    public void OnItemInserted(Item insertedItem) {
        TreatmentDropDown.ClearSelection();
        FirstNameTextbox.Text = "";
        MiddleNameTextbox.Text = "";
        LastNameTextbox.Text = "";
        SecondLastNameTextbox.Text = "";
        WeightTextbox.Text = "";

        _presenter.List();
    }

    public float Weight {
        get { return float.Parse(WeightTextbox.Text); }
    }

    #endregion
}
```

Not as clean as it used to be, now we have to deal with six controls just for a single field, and it gets more and more messy as new controls get added. That is, more controls to take data from and to clean up when a new item is inserted.

Further more, there is another issue I didn't state in the previous example: We are dealing with data conversion; the `WeightTextbox` control is a textbox and thus it can only give us text. Conversion is easy and type validation can be enforced with the `asp:CompareValidator`, but multiply that for each floating point, integer or whatever numeric field we can have in our application.

Hundreds of times writing the same thing: the same Label attached to that textbox whith its companion comparison and/or required validator. Doing the same type conversions over and over again.

### Strongly typed controls

There must be something we can do. Well, solving this issue is as simple as doing this.

1. Create user controls for common data types.
2. Create user controls for *Value Objects* or for simple types which need several controls to build their value.
3. Give them a common interface.

We will detail each step now:

#### Create user controls for common data types.

It is almost sure that your project will have fields of common types like strings, numbers, dates, etc. So, the first thing to do is to create user controls that have just a label, a textbox and a comparison validator to ensure the data type when needed.

Then, the first thing to do is to 

#### Create user controls for *Value Objects* or for simple types which need several controls to build their value.

Either if our fullname field is a value object or a string made up of several values, it is usual to see common sets of controls that end repeated in several pages. For those is necessary to create a user control that renders the necessary controls, process the data that comes from them and then, return a value to be used.

#### Give them a common interface.

To this point you may have realized that there are just three usual operations: "Tell me if you have anything", "Give me your data" and "Get clean". they almost allways do the same things, so it is natural to create an interface for all those, so they are not just recycleable, but also composable into structures that make sense, like, say, a collection of filters for which certain operations can be applied (more on this in the final example). 

### Improving extensibility: allowing to add validators



### A final example, a filters panel



### Side note

**Change this** ---> Any developer with some level of taste for good coding could come out with something similar or better than what I've exposed here, is kind of just common sense, my intention here is to present a simple suggestion on how to organize your user controls in a way that can improve a project's speed of development and GUI's uniformity and that is easy to teach to others.

